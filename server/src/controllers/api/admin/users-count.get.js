const db = require("../../../database/db");

module.exports = {
  params: ["role"],
  fn: async (req, res) => {
    let { role } = req.params;
    role = role.toUpperCase().trim();
    const count = await db.User.countDocuments({ role });
    return res.status(200).json({ count });
  }
}