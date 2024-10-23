const path = require("node:path");
const fs = require("fs");
const imgToPDF = require("image-to-pdf");
const PDFMerger = require("pdf-merger-js");
const db = require("../../../database/db");
const GeneralController = require("../general/controller");

module.exports = {
  fn: GeneralController.uploadResult
}

