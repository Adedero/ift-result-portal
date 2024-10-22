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
          { regNumber: id },
          { staffId: id }
        ]
      }
    ).lean();
    if (!user) return res.status(400).json({
      info: "User Not found",
      message: 'Check the username, email, registration number or staff ID provided'
    });
    const { _id, faceDescriptor } = user;

    if (!faceDescriptor) {
      return res.status(400).json({
        info: "No Face ID",
        message: 'You do not have face ID set up yet. Log in with your password to continue.'
      });
    }
      
    return res.status(200).json({ id: _id, faceDescriptor });
  }
}
