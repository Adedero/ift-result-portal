require("dotenv").config();
const { generateAuthenticationOptions } = require("@simplewebauthn/server");
const db = require("../../database/db");


module.exports = {
  params: ["userId"],
  fn: async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        info: "Bad request",
        message: "No user ID was provided"
      });
    }

    const user = await db.User.findOne(
      {
        $or: [
          { username: userId },
          { email: userId },
          { registrationNumber: userId },
          { staffId: userId }
        ]
      }
    );

    if (!user) {
      return res.status(404).json({
        info: "Not Found",
        message: "User not found. Check the username, email, registration number or staff ID provided."
      });
    }

    const options = await generateAuthenticationOptions({
      rpID: process.env.RP_ID,
      allowCredentials: user.passkeys.map(passkey => ({
        id: passkey.id,
        transports: passkey.transports
      }))
    });

    user.options = options;
    await user.save();

    return res.json({
      info: "Logging in",
      options,
      user: {
        id: user._id,
      }
    });
  }
}