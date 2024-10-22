const db = require("../../../database/db");

module.exports = {
  fn: async (req, res) => {
    const { id } = req.user;

    await db.User.updateOne({ _id: id }, { faceDescriptor: {} });
    return res.status(200).json({
      info: "Done",
      message: "Face ID data deleted."
    })
  }
}