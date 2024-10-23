require("dotenv").config();
var admin = require("firebase-admin");
const { getStorage } = require('firebase-admin/storage');


var serviceAccount = process.env.NODE_ENV === "production" ?
  require("/etc/secrets/csc-portal-4d2d8-firebase-adminsdk-c85wv-4356db7bb1.json") :
  require("./csc-portal-4d2d8-firebase-adminsdk-c85wv-4356db7bb1.json")


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://csc-portal-4d2d8.appspot.com"
});

const bucket = getStorage().bucket();

module.exports = bucket;