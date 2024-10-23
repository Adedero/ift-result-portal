const db = require("../../../database/db")

module.exports = {
  fn: async (req, res) => {
    const courses = await db.Course.find();
    return res.status(200).json(courses);
  }
}