const db = require("../../../database/db");
const fs = require("node:fs");
const path = require("node:path");

module.exports = {
  fn: async (req, res) => {
    const { result } = req.body;

    if (!result) {
      return res.status(400).json({ info: "Failed", message: "No result provided" });
    }
    
    fs.unlink(path.resolve(`public/results/${result.name}`), (err) => {
      if (err) throw err;
    })

    const deletedResult = await db.Result.findByIdAndDelete(result._id);
    return res.status(200).json({ success: true, result: deletedResult });
  }
}