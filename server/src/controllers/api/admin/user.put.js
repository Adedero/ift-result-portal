const db = require("../../../database/db");

module.exports = {
  params: ["id"],
  fn: async (req, res) => {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({
        info: "Bad request",
        message: "No user data was supplied."
      });
    }
    delete user._id
    delete user.password

    await db.User.updateOne({ _id: id }, user);
    return res.status(200).json({
      info: "User updated successfully",
      user
    });
  }
}