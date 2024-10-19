const db = require("../../database/db");

module.exports = {
  params: ["id"],
  
  fn: async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({
      info: "No ID provided",
      message: 'A username, email, registration number, or staff ID is required.'
    });

    const user = await db.User.findOne(
      {
        $or: [
          { username: id },
          { email: id },
          { registrationNumber: id },
          { staffId: id }
        ]
      }
    ).lean();
    if (!user) return res.status(400).json({
      info: "Not found",
      message: 'User not found. Check the username, email, registration number or staff ID provided'
    });
    const { faceDescriptor } = user;
    if (!faceDescriptor || faceDescriptor.descriptor) return res.status(400).json({
      info: "No Face ID", message: 'You do not have face ID set up yet.'
    });

    return res.status(200).json({ faceDescriptor });
  }
}
