const db = require("../../../database/db");
const fs = require("node:fs");
const path = require("node:path");
const { deleteFiles } = require("../../../utils/upload-file");

module.exports = {
  fn: async (req, res) => {
    const { result } = req.body;

    if (!result) {
      return res.status(400).json({ info: "Failed", message: "No result provided" });
    }
  
    const [ deletedResult ] = await Promose.all([
      db.Result.findByIdAndDelete(result._id),
      deleteFiles(result.name, { path: "ift/results" })
    ])
    return res.status(200).json({ success: true, result: deletedResult });
  }
}