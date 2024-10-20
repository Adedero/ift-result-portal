const db = require("../../../database/db");

module.exports = {
  params: ["role"],
  fn: async (req, res) => {
    let { role } = req.params;
    let{ page, limit } = req.query;
    if (!role) {
      return res.status(400).json({ info: "Bad request", message: "No user role specified" });
    }
    role = role.trim().toUpperCase();
    page = parseInt(page) || 0;
    limit = parseInt(limit) || 50;
    const skip = page * limit;

    const users = await db.User.find(
      { role },
      { password: 0, passkeys: 0, options: 0 }
    )
      .skip(skip)
      .limit(limit)
      .lean();
    return res.status(200).json(users);
  }
}