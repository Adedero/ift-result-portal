const db = require("../../../database/db");

module.exports = {
  params: ["role?"],
  fn: async (req, res) => {
    let { role } = req.params;
    const currentDate = new Date();
    let pins = {};

    if (role) {
      role = role.toUpperCase();
      const rolePins = await db.Pin.find({ role, validity: { $gt: currentDate } }).lean();
      pins[role.toLowerCase()] = rolePins;
      return res.status(200).json(pins);
    }

    const allPins = await db.Pin.find({ validity: { $gt: currentDate } }).lean();

    allPins.forEach(pin => {
      const roleKey = pin.role.toLowerCase();
      if (!pins[roleKey]) {
        pins[roleKey] = [];
      }
      pins[roleKey].push(pin);
    });

    return res.status(200).json(pins);
  }
}