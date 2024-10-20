const db = require("../../../database/db");
const path = require("node:path");
const fs = require("node:fs");
const logger = require("../../../config/winston.config");

module.exports = {
  params: ["id"],
  fn: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        info: "Bad request",
        message: "Missing user ID"
      })
    }

    const user = await db.User.findById(id);
    if (!user) {
      return res.status(404).json({
        info: "Not Found",
        message: "User not found"
      });
    }
    if (user.image) {
      const imgDir = path.resolve(`public/users/${user.role.toLowerCase().trim()}s`);
      const fileName = user.image.split("/").pop();
      fs.unlink(path.join(imgDir, fileName), (err) => {
        if (err) {
          logger.info({
            message: `Error deleting image for user ${user.name}: ${err.message}`,
            timeStamp: Date.now()
          })
        }
      })
    }
    await Promise.all([
      db.User.findByIdAndDelete(id),
      db.Result.updateMany({ staff: user._id }, { staff: req.user.id })
    ]);
    return res.status(200).json({
      success: true,
      info: "Deleted",
      message: `The ${user.role.toLowerCase()} has been deleted successfully`
    })
  }
}