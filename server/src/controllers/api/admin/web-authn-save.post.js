require("dotenv").config();

const { verifyRegistrationResponse } = require("@simplewebauthn/server");
const fido2 = require("../../../config/fido2lib.config");

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
    const { webAuthnJSON } = req.body;
    if (!webAuthnJSON) {
      return res.status(400).json({
        info: "Registration failed",
        message: "Could not complete biometric registration. Try starting again."
      });
    }
    const user = await db.User.findById(userId);
    if (!user) {
      return res.status(404).json({
        info: "Not Found",
        message: "User not found"
      });
    } 
    if (!user.options) {
      return res.status(400).json({
        info: "Registration failed",
        message: "Could not complete biometric registration. Try starting again."
      });
    }

    const verification = await verifyRegistrationResponse({
      response: webAuthnJSON,
      expectedChallenge: user.options.challenge,
      expectedOrigin: process.env.CLIENT_URL,
      expectedRPID: user.options.rp.id
    });

    if (verification.verified) {
      user.passkeys.push({
        id: verification.registrationInfo.credential.id,
        publicKey: verification.registrationInfo.credential.publicKey,
        counter: verification.registrationInfo.credential.counter,
        deviceType: verification.registrationInfo.credentialDeviceType,
        backedUp: verification.registrationInfo.credentialBackedUp,
        transports: webAuthnJSON.transports
      });

      delete user.options;
      await user.save();
    }
    

    return res.status(200).json({
      verified: verification.verified,
      info: verification.verified ? "Registration successful" : "Registration failed",
      message: verification.verified ? "Biometric registration completed successfully." : "Biometric registration failed. Try again later.",
    });
  }
}