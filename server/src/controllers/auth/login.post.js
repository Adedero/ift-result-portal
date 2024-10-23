require("dotenv").config();
const db = require("../../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  fn: async (req, res) => {
    const { id, password } = req.body;

    const user = await db.User.findOne({
      $or: [
        { username: id },
        { staffId: id },
        { regNumber: id }
      ]
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        info: "Authentication failed.",
        message: 'Invalid email. Check your email and try again.',
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        info: "Login failed.",
        message: "Wrong password."
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({
      success: true,
      info: "Login successful.",
      message: "User logged in successfully.",
      user: {
        id: user._id,
        title: user.title,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        staffId: user.staffId,
        studentClass: user.studentClass,
        regNumber: user.regNumber,
        sex: user.sex,
        image: user.image,
        level: user.level,
        token: token,
        faceDescriptor: user.faceDescriptor
      }
    })
  }
}