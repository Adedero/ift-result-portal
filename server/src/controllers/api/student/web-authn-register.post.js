require("dotenv").config();
const db = require("../../../database/db");
const { generateRegistrationOptions } = require("@simplewebauthn/server");

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
    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({
        info: "Not Found",
        message: "User not found"
      });
    } 
    if (!user.passkeys) {
      user.passkeys = []
    }

    const options = await generateRegistrationOptions({
      rpID: process.env.RP_ID,
      rpName: process.env.RP_NAME,
      userName: `${user.firstName} ${user.lastName}`,
      userID: userId,
      excludeCredentials: user.passkeys.map(passkey => ({
        id: passkey.id,
        type: "public-key",
        transports: passkey.transports,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
    });
     user.options = options;
     await user.save();

    console.log(options);
    return res.status(200).json({ options })
  }
}

/* const buffer = Buffer.from(yourArrayBuffer);

const base64String = buffer.toString('base64'); */