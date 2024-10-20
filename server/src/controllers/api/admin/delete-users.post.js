const db = require("../../../database/db");
const fs = require("node:fs");
const path = require("node:path");
const logger = require("../../../config/winston.config");

module.exports = {
  params: ["role"],
  fn: async (req, res) => {
    const { role } = req.params;
    const users = req.body;
    const total = users.length;
    const userIds = users.map(user => user._id);

    for (i = 0; i < total; i++) {
      if (users[i].image) {
        const imgDir = path.resolve(`public/users/${role.trim()}s`);
        const fileName = users[i].image.split("/").pop();
        fs.unlink(path.join(imgDir, fileName), (err) => {
          if (err) {
            logger.info({
              message: `Error deleting image for user ${users[i].name}: ${err.message}`,
              timeStamp: Date.now()
            })
          }
        })
      }
    }

    await db.User.deleteMany({ _id: { $in: userIds } });
    return res.status(200).json({ success: true, info: "Done", message: "Users deleted" });
  }
}