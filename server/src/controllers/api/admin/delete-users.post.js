const db = require("../../../database/db");
const fs = require("node:fs");
const path = require("node:path");
const logger = require("../../../config/winston.config");
const { deleteFiles } = require("../../../utils/upload-file");

module.exports = {
  params: ["role"],
  fn: async (req, res) => {
    const { role } = req.params;
    const users = req.body;
    const total = users.length;
    const userIds = users.map(user => user._id);
    const userImageNames = users
      .map(user => user.imageName)
      .filter(name => typeof name === "string" && name.length !== 0) 

    if (userImageNames.length) {
      await deleteFiles(userImageNames, { path: "ift/users" });
    }
    /* for (i = 0; i < total; i++) {
      if (users[i].image) {
        const imgDir = path.resolve(`public/users/${role.toLowerCase().trim()}s`);
        const fileName = users[i].image.split("/").pop();
        fs.unlink(path.join(imgDir, fileName), (err) => {
          if (err) {
            logger.info({
              message: `Error deleting image for user ${users[i].name}: ${err.message}`,
              timeStamp: Date.now()
            });
          }
        });
      }
    } */

    await Promise.all([
      db.User.deleteMany({ role : role.trim().toUpperCase(), _id: { $in: userIds } }),
      db.Result.updateMany({ staff: { $in: userIds } }, { staff: req.user.id })
    ])
    return res.status(200).json({ success: true, info: "Done", message: "Users deleted" });
  }
}