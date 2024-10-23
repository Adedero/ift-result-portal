const db = require("../../database/db");
const bcrypt = require("bcrypt");
const isPinExpired = require("../../utils/validate-pin");

module.exports = {
  params: ["id"],
  fn: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        info: "Not found",
        message: "User not found."
      })
    }

    const { OTP, passwords } = req.body;
    if (!OTP || !OTP.length === 6) {
      return res.status(400).json({
        info: "Invalid OTP",
        message: "The OTP provided is invalid and cannot be used."
      });
    }

    if (!passwords || !passwords.newPassword || !passwords.confirmPassword) {
      return res.status(400).json({
        info: "Failed",
        message: "Your new password is required"
      })
    }

    passwords.newPassword = passwords.newPassword.trim();
    passwords.confirmPassword = passwords.confirmPassword.trim()

    const { newPassword, confirmPassword } = passwords;

    if (!newPassword.length >= 8) {
      return res.status(400).json({
        info: "Invalid password",
        message: "Your new password must be at least 8 characters"
      })
    }

    if (confirmPassword !== newPassword) {
      return res.status(400).json({
        info: "Passwords do not match",
        message: "Confirm your new password and try again"
      })
    }

    const [ user, otp, hpassword ] = await Promise.all([
      db.User.findById(id),
      db.Otp.findOne({ user: id }),
      bcrypt.hash(newPassword, 10)
    ])

    if (!user) {
      return res.status(404).json({
        info: "Not found",
        message: "User not found."
      })
    }

    if (!otp) {
      return res.status(400).json({
        info: "Invalid OTP",
        message: "The OTP provided is invalid or expired."
      })
    }

    if (isPinExpired(otp.validity)) {
      await db.Otp.deleteOne({ _id: otp._id })
      return res.status(400).json({
        info: "Invalid OTP",
        message: "The OTP provided is invalid or expired."
      });
    }

    if (parseInt(OTP) !== otp.value) {
      return res.status(400).json({
        info: "Wrong OTP",
        message: "Check your email for the correct OTP and try again"
      })
    }


    user.password = hpassword;
    await Promise.all([
      db.Otp.deleteOne({ _id: otp._id }),
      user.save()
    ]);
    return res.status(200).json({
      success: true,
      info: "Done",
      message: "Password has been successfully reset."
    })
  }
}