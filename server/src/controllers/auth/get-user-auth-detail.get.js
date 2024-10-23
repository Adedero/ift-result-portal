const mongoose= require("mongoose");
const db = require("../../database/db");

module.exports = {
  params: ["id"],
  fn: async (req, res) => {
    const { id } = req.params;

    if (!id || !mongoose.isObjectIdOrHexString(id)) {
      return res.status(404).json({
        info: "Not found",
        message: "Invalid user ID"
      })
    }

    const user = await db.User.findById(id).lean();
    if (!user) {
      return res.status(404).json({
        info: "Not found",
        message: "User not found"
      })
    }

    const safeUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }

    return res.status(200).json(safeUser);
  }
}