const db = require("../../../database/db");
const fs = require("node:fs");
const path = require("node:path");
const logger = require("../../../config/winston.config");


module.exports = {
  fn: async (req, res) => {
    const results = req.body;
    const total = results.length;
    const resultIds = results.map(result => result._id);

    for (i = 0; i < total; i++) {
      fs.unlink(path.resolve(`public/results/${results[i].name}`), (err) => {
        if (err) {
          logger.info({
            message: "Error deleting result file",
            error: err.message,
            name: results[i].name,
            timeStamp: Date.now()
          })
        }
      })
    }

    await db.Result.deleteMany({ _id: { $in: resultIds } });
    return res.status(200).json({ success: true, info: "Done", message: "Results deleted." });
  }
}