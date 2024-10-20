const bcrypt = require('bcrypt');
const db = require('../../../database/db');

module.exports = {
  params: ["id"],
  fn: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        info: "Bad request",
        message: "User ID is required."
      });
    }

    const { password } = req.body;
    if (!password || !password.length > 7) {
      return res.status(400).json({
        info: "Inavlid password",
        message: "Password must be at least 8 characters."
      });
    }

    const user = await db.User.findById(id);
    if (!user) {
      return res.status(404).json({
        info: "User not found",
        message: "No user found with the given ID."
      });
    }
    const hpassword = await bcrypt.hash(password, 10);
    user.password = hpassword;
    await user.save();

    return res.status(200).json({
      info: "Done",
      message: "User password updated successfully",
    })
  }
}