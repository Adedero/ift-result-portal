const mongoose = require("mongoose");
const db = require("../../../database/db");

const GeneralController = {
  getResult: async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        info: "Invalid ID",
        message: "the result ID provided is not valid."
      })
    }
    const result = await db.Result.findById(id);
    if (!result) {
      return res.status(400).json({
        info: "Result not found",
        message: "No result found with the provided ID."
      })
    }
    return res.status(200).json({ result })
  },

  getCourses: async (req, res) => {
    const courses = await db.Course.find({});
    return res.status(200).json({ courses })
  },

  getUserFaceDescriptor: async (req, res) => {
    const { id } = req.user;
    if (!id) return res.status(400).json({
      info: "Failed",
      message: 'No ID provided'
    });

    const user = await db.User.findById(id).lean();
    if (!user) return res.status(400).json({
      info: "Not found",
      message: 'User not found. Check the username, email, registration number or staff ID provided'
    });
    const { faceDescriptor } = user;

    return res.status(200).json({ faceDescriptor });
  }
}

module.exports = GeneralController;