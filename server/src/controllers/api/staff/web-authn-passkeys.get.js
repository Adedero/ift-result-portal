const db = require("../../../database/db");

module.exports = {
  params: ["userId"],
  fn: async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        info: "Bad request",
        message: "No user ID was provided"
      });
    }

    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({
        info: "Not Found",
        message: "User not found"
      });
    }
    const { passkeys } = user;

    return res.json({
      passkeys
    });
  }
}