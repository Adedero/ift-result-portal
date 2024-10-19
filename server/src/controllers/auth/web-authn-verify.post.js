require("dotenv").config();
const { verifyAuthenticationResponse } = require("@simplewebauthn/server");

module.exports = {
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
        info: "Login failed",
        message: "Log in with your password and try registering your biometrics again."
      });
    }

    const verification = await verifyAuthenticationResponse({
      response: webAuthnJSON,
      expectedChallenge: user.options.challenge,
      expectedOrigin: process.env.CLIENT_URL,
      expectedRPID: user.options.rp.id,
      credential: webAuthnJSON.id,
      /* authenticator: {
        credentialID: passkey.id,
        credentialPublicKey: passkey.publicKey,
        counter: passkey.counter,
        transports: passkey.transports,
      }, */
    })

    if (verification.verified) {
      user.passkey.forEach(passkey => {
        if (passkey.id === verification.registrationInfo.credential.id) {
          passkey.counter = verification.registrationInfo.credential.counter;
        }
      });

      delete user.options;
      await user.save();
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return res.status(200).json({
        verified: verification.verified,
        user: {
          id: user._id,
          title: user.title,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          staffId: user.staffId,
          studentClass: user.studentClass,
          regNumber: user.regNumber,
          sex: user.sex,
          image: user.image,
          level: user.level,
          token: token
        }
      })
    }

    return res.status(200).json({
      verified: verification.verified,
      info: "Login failed",
      message: "Failed to login. Try using your password instead."
    });
  }
}