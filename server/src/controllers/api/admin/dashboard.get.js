const db = require("../../../database/db")

module.exports = {
  fn: async (req, res) => {
    const [admins, staffs, students, results, recentResults] = await Promise.all([
      db.User.countDocuments({ role: "ADMIN" }),
      db.User.countDocuments({ role: "STAFF" }),
      db.User.countDocuments({ role: "STUDENT" }),
      db.Result.estimatedDocumentCount(),
      db.Result.find()
        .sort({ createdAt: 'desc' })
        .limit(5)
        .populate({ path: "staff", select: "firstName lastName" })
        .lean()
    ]);

    const data = { admins, staffs, students, results, recentResults };
    return res.status(200).json(data);
  }
}