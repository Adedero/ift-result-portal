const db = require("../../database/db");
const isPinExpired = require("../../utils/validate-pin");

module.exports = {
  params: ["pin"],
  fn: async (req, res) => {
    let { pin } = req.params;
    pin = pin.trim();
    if (!pin) {
      return res.status(400).json({
        success: false,
        info: "Missing Pin",
        message: "You need to provide a pin to complete the registration."
      })
    }

    const existingPin = await db.Pin.findOne({ value: pin }).lean();
    if (!existingPin) {
      return res.status(400).json({
        success: false,
        info: "Invalid Pin",
        message: "The provided pin is not valid.",
        pin: {
          isValid: false
        }
      });
    }

    const isExpired = isPinExpired(existingPin.validity);
    if (isExpired) {
      await db.Pin.deleteOne({ value: existingPin.value });
      return res.status(400).json({
        success: false,
        info: "Pin Expired",
        message: "The provided pin has expired. Contact the admin office to generate a new one.",
        pin: {
          isValid: false
        }
      });
    }

    return res.status(200).json({
      success: true,
      info: "Valid",
      message: "The provided pin is valid.",
      pin: {
        isValid: true,
        value: existingPin.value,
        validity: existingPin.validity,
        role: existingPin.role,
      }
    });
  }
}