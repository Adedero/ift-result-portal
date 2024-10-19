require("dotenv").config();
const { Fido2Lib } = require('fido2-lib');

const fido2 = new Fido2Lib({
  timeout: 60000,
  rpId: process.env.SERVER_URL,
  rpName: "IFT Result Portal",
  rpIcon: `${process.env.SERVER_URL}/assets/futo-logo.svg`,
  challengeSize: 128,
  attestation: "direct", //"none"
  cryptoParams: [-7, -257],
  authenticatorAttachment: "platform",
  authenticatorRequireResidentKey: false,
  authenticatorUserVerification: "preferred" //"required"
});

module.exports = fido2;
