require("dotenv").config();
require("./database/db").connectDB();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const fileUpload = require("express-fileupload");
const PORT = process.env.PORT;
const asyncErrorHandler = require("./middleware/async-errors");
const passport = require("./config/passport.config");
const path = require("node:path");


global.isInProductionEnv = process.env.NODE_ENV === "production";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({ createParentPath: true, limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(passport.initialize());

app.use("/auth", require("./routes/auth/auth.routes"));
app.use("/api", require("./routes/api/api.routes"));

app.use((req, res) => res.status(404).json({ message: "Not Found." }));
app.use(asyncErrorHandler);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
