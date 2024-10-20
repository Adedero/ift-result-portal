const db = require("../../../database/db");

module.exports = {
  params: ["role?"],
  fn: async (req, res) => {
    let { role } = req.params;
    let pins;
    if (role) {
      role = role.toUpperCase();
      pins = await db.Pin.find({ role }).lean();
    }

    if (!role) {
      pins = await db.Pin.find().lean();
    }

    return res.status(200).json(pins);
  }
}