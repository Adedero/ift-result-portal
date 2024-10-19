const mongoose = require("mongoose");
const db = require("../../../database/db")

module.exports = {
  fn: async (req, res) => {
    const { id } = req.user;
    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(404);
    }
    const [results, courses] = await Promise.all([
      db.Result.find({ staff: id }).lean(),
      db.Course.find()
    ])
    return res.status(200).json({ results, courses });
  }
}