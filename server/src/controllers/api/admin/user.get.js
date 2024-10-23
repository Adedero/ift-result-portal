const db = require("../../../database/db");

module.exports = {
  params: ["id"],
  fn: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const user = await db.findById(id).lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    delete user.password;
    delete user.passkeys
    delete user.options;
    res.json(user);
  }
}