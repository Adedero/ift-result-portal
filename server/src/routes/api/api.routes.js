const express = require("express");
const Router = express.Router();
const authenticateJWT = require("../../middleware/authenticate-jwt");

Router.use("/admin", authenticateJWT.admin, require("./admin.routes"));
Router.use("/staff", authenticateJWT.staff, require("./staff.routes"));
Router.use("/student", authenticateJWT.student, require("./student.routes"));

module.exports = Router;