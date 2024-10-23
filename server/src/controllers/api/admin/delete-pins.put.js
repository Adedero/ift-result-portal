const db = require("../../../database/db");

module.exports = {
  fn: async (req, res) => {
    const { pins, expired, role } = req.body;
    if (!pins) {
      return res.status(400).json({
        info: "No PINs provided"
      });
    }
    const currentDate = new Date();

    if (pins.length === 0) {
      if (expired && role) {
        await db.Pin.deleteMany({ role, validity: { $lt: currentDate }})
        return res.status(200).json({
          info: "Done",
          message: `All expired ${role.toLowerCase()} PINs deleted.`
        });
      }

      if (expired && !role) {
        await db.Pin.deleteMany({ validity: { $lt: currentDate }})
        return res.status(200).json({
          info: "Done",
          message: "All expired PINs deleted."
        });
      }

      if (role && !expired) {
        await db.Pin.deleteMany({ role })
        return res.status(200).json({
          info: "Done",
          message: `All ${role.toLowerCase()} PINs deleted.`
        });
      }

      await db.Pin.deleteMany({});
      return res.status(200).json({
        info: "Done",
        message: "All PINs deleted."
      });
    }

    const pinIds = pins.map(pin => pin._id);

    if (expired && role) {
      await db.Pin.deleteMany({ _id: { $in: pinIds }, role, validity: { $lt: currentDate } })
      return res.status(200).json({
        info: "Done",
        message: `Selected expired ${role.toLowerCase()} PINs deleted.`
      });
    }

    if (expired && !role) {
      await db.Pin.deleteMany({ _id: { $in: pinIds }, validity: { $lt: currentDate }})
      return res.status(200).json({
        info: "Done",
        message: "Selected expired PINs deleted."
      });
    }

    if (role && !expired) {
      await db.Pin.deleteMany({ _id: { $in: pinIds }, role })
      return res.status(200).json({
        info: "Done",
        message: `Selected ${role.toLowerCase()} PINs deleted.`
      });
    }

    await db.Pin.deleteMany({ _id: { $in: pinIds } });
    return res.status(200).json({
      info: "Done",
      message: "Selected PINs deleted."
    });
  }
}