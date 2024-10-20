const db = require("../../../database/db")

module.exports = {
  fn: async (req, res) => {
    const { page, limit } = req.query;
    let limitInt = parseInt(limit) || 50
    let pageInt = parseInt(page) || 0;
    const skip = pageInt * limitInt

    const results = await db.Result.find().skip(skip).limit(parseInt(limitInt)).lean()    
    return res.status(200).json({ results })
  }
}