const db = require("../../../database/db");
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
  fn: async (req, res) => {
    const results = req.body;
    const total = results.length;
    const resultIds = results.map(result => result._id);

    for (i = 0; i < total; i++) {
      fs.unlink(path.resolve(`public/results/${results[i].name}`), (err) => {
        if (err) throw err;
      })
    }

    await db.Result.deleteMany({ _id: { $in: resultIds } });
    const addedResults = await db.Result.find().limit(total);

    return res.status(200).json({ results: addedResults });
  }
}