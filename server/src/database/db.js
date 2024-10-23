require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const logger = require("../config/winston.config");
const MONGODB_URI = process.env.MONGODB_URI;
const modelsDir = path.join(__dirname, "../models");
const db = {};

db.connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    initializeModels();
    console.log("MongoDB connected successfully");
    //if (!global.isInProductionEnv) console.log("MongoDB connected successfully");
  } catch (err) {
    if (global.isInProductionEnv) {
      logger.error({
        name: "MongoDB connection error",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }  else {
      console.error("MongoDB connection error:", err.message);
    }
    process.exit(1);
  }
};

function initializeModels() {
  fs
    .readdirSync(modelsDir)
    .filter(file => file.includes('model') && file.endsWith('.js'))
    .forEach(file => {
      const model = require(path.join(modelsDir, file))(mongoose);
      db[model.name] = mongoose.model(model.name, model.schema);
    });
}

module.exports = db;

