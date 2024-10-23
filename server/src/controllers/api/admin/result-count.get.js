const db = require("../../../database/db")

module.exports = {
  fn: async (req, res) => {
    const count = await db.Result.estimatedDocumentCount()
    return res.status(200).json({ count })
  }
}