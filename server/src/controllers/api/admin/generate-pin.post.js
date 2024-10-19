const db = require("../../../database/db");
const generateRandomPin = require("../../../utils/generate-random-pin");
const getPinExpiry = require("../../../utils/get-pin-expiry");

module.exports = {
  fn: async (req, res) => {
    const { role, validity, amount } = req.query;
    if (!role || !validity || !amount) {
      return res.status(400).json({
        success: false,
        info: "Missing parameters",
        message: "Please provide the users' role, validity period of the pins, and the amount you want to generate."
      });
    }

    const pins = [];

    for (let i = 0; i < amount; i++) {
      const pin = generateRandomPin(10, 'numeric');
      const validityPeriod = getPinExpiry(validity);
      pins.push({ value: pin, role, validity: validityPeriod, isUsed: false });
    }

    await db.Pin.insertMany(pins);
    return res.status(200).json({ pins });
  }
}