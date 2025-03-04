const express = require("express");
const Router = express.Router();
const path = require("node:path");
const dir = path.resolve("src/controllers/auth");
const routeGenerator = require("../../utils/route-generator");

routeGenerator(Router, dir);

module.exports = Router;