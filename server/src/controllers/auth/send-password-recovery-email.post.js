const db = require("../../database/db");
const generateRandomPin = require("../../utils/generate-random-pin");
const getPinExpiry = require("../../utils/get-pin-expiry");
const { sendTextEmail } = require("../../utils/mailer");
const isPinExpired = require("../../utils/validate-pin");

module.exports = {
  fn: async (req, res) => {
    let { email } = req.body;
    email = email.trim();
    if (!email) {
      return res.status(400).json({
        info: "Missing email",
        message: "No email address provided."
      })
    }

    const user = await db.User.findOne({ email }).lean();
    if (!user) {
      return res.status(400).json({
        info: "Not found",
        message: "No account with this email found. Check the email and try again, or contact the admin for a password reset."
      })
    }

    const expiration = "1 hour";

    let otp = await db.Otp.findOne({ user: user._id });
    if (!otp) {
      const newOtp = {
        user: user._id,
        value: generateRandomPin(6, 'numeric'),
        validity: getPinExpiry("1 hour"),
        isNew: true
      }
      otp = newOtp
    }

    if (isPinExpired(otp.validity)) {
      if (otp._id) {
        await db.Otp.deleteOne({ _id: otp._id })
      }

      const newOtp = {
        user: user._id,
        value: generateRandomPin(6, 'numeric'),
        validity: getPinExpiry("1 hour"),
        isNew: true
      }

      otp = newOtp
    }

    const text = `Your secure OTP is ${otp.value}. Note that this password expires in ${expiration}`;
    
    const [_, error] = await sendTextEmail(user.email, "IFT Result Portal Password Recovery", text);
    if (error) {
      return res.status(500).json({
        success: false,
        info: 'Network Error',
        message: 'Could not send OTP to email. Please, check your network connection and try again.'
      });
    }

    if (otp.isNew) {
      await db.Otp.create(otp)
    }


    return res.status(200).json({
      success: true,
      info: 'OTP sent',
      message: 'An OTP has been sent to your email.',
      userId: user._id
    });
  }
}
