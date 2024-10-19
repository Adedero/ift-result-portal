const path = require("node:path");
const fs = require("fs");
const imgToPDF = require("image-to-pdf");
const PDFMerger = require("pdf-merger-js");
const db = require("../../../database/db");

module.exports = {
  fn: async (req, res) => {
    let { data } = req.body;
    const parsedData = JSON.parse(data);
    const { courseCode, courseTitle, session } = parsedData;

    if (!courseCode || !courseTitle || !session) {
      return res.status(400).json({
        info: "Missing fields",
        message: "Course title, course code, and result session are required.",
      });
    }

    if (!Object.keys(req.files).length) {
      return res.status(400).json({
        info: "No files found",
        message: "Please upload at least one pdf or image file.",
      });
    }

    const formattedCourseCode = courseCode.split(" ").join("-").toUpperCase();
    const fileName = `${formattedCourseCode}-${session}.pdf`;
    const uploadDir = path.resolve("public/results");
    const filePath = path.join(uploadDir, fileName);
    const url = `${req.protocol}://${req.get("host")}/results/${fileName}`;

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      const imgFiles = [];
      const pdfFiles = [];

      // Separate files into images and PDFs
      Object.keys(req.files).forEach((key) => {
        const file = req.files[key];
        const mimeType = file.mimetype;

        if (mimeType.startsWith("image/")) {
          imgFiles.push(file);
        } else if (mimeType === "application/pdf") {
          pdfFiles.push(file);
        }
      });

      const convertedPDFPaths = [];

      // Handle image conversion to PDF
      if (imgFiles.length > 0) {
        const imageBuffers = imgFiles.map((file) => file.data);

        await new Promise((resolve, reject) => {
          imgToPDF(imageBuffers, imgToPDF.sizes.A4)
            .pipe(fs.createWriteStream(filePath))
            .on('finish', () => {
              convertedPDFPaths.push(filePath); // Store converted path
              resolve();
            })
            .on('error', (err) => reject(new Error(`Error converting images to PDF: ${err.message}`)));
        });
      }

      // Handle PDF files saving
      const savedPDFPaths = await Promise.all(pdfFiles.map((file) => {
        return new Promise((resolve, reject) => {
          file.mv(filePath, (err) => {  // Overwriting if file exists
            if (err) reject(new Error(`Error moving PDF file: ${err.message}`));
            else resolve(filePath);
          });
        });
      }));

      // If there are multiple files (either images or PDFs), merge them
      if (convertedPDFPaths.length + savedPDFPaths.length > 1) {
        const merger = new PDFMerger();
        [...convertedPDFPaths, ...savedPDFPaths].forEach((pdfPath) => {
          merger.add(pdfPath);
        });

        await merger.save(filePath); // Save merged file as the same path

        // Clean up individual files after merging
        [...convertedPDFPaths, ...savedPDFPaths].forEach((file) => {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file); // Delete individual files after merging
          }
        });
      }

      // If only a single file is uploaded (either PDF or image)
      if (Object.keys(req.files).length === 1) {
        const file = Object.values(req.files)[0];
        const mimeType = file.mimetype;

        if (mimeType === "application/pdf") {
          await new Promise((resolve, reject) => {
            file.mv(filePath, (err) => { // Overwriting the PDF file
              if (err) reject(new Error(`Error saving the PDF file: ${err.message}`));
              else resolve();
            });
          });
        } else if (mimeType.startsWith("image/")) {
          await new Promise((resolve, reject) => {
            imgToPDF([file.data], imgToPDF.sizes.A4)
              .pipe(fs.createWriteStream(filePath))
              .on('finish', resolve)
              .on('error', (err) => reject(new Error(`Error converting image to PDF: ${err.message}`)));
          });
        } else {
          return res.status(400).json({
            message: "Unsupported file type. Please upload a PDF or image file.",
          });
        }
      }

      // Using findOneAndUpdate to either create or update the result
      const result = await db.Result.findOneAndUpdate(
        { session, courseCode, courseTitle },
        {
          staff: req.user.id,
          session,
          courseCode: formattedCourseCode,
          courseTitle: courseTitle.trim(),
          name: fileName,
          type: "application/pdf",
          url,
        },
        { new: true, upsert: true }  // Create if not found
      );

      // Final success response after all operations
      return res.status(200).json({
        result,
        message: "File processed and saved successfully",
        url,
      });

    } catch (err) {
      console.error(err.message);
      return res.status(500).json({
        message: "An error occurred during file processing",
        error: err.message,
      });
    }
  }
}

