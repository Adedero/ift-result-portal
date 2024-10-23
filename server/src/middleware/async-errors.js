const logger = require("../config/winston.config");

const asyncErrorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (global.isInProductionEnv) {
    logger.error({
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  }
  return res.status(500).json({ info: "Failed", message: "Something went wrong. Try again later." });
}

module.exports = asyncErrorHandler;