const db = require("../../../database/db");

module.exports = {
  fn: async (req, res) => {
    const { descriptor } = req.body;
    if (!descriptor) {
      return res.status(400).json({
        info: "Failed",
        message: "No facial data was captured. Try registering again."
      })
    }

    await db.User.updateOne({ _id: req.user.id }, { faceDescriptor: descriptor });
    
    return res.status(200).json({
      info: "Done",
      message: "Face Id has been set up successfully.",
      descriptor
    });
  }
}