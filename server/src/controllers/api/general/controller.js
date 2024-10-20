const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const db = require("../../../database/db");
const path = require("node:path");
const fs = require("fs");
const imgToPDF = require("image-to-pdf");
const PDFMerger = require("pdf-merger-js");
const logger = require("../../../config/winston.config");

const GeneralController = {
  getResult: async (req, res) => {
    const { id } = req.params;
    if (!id || !mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        info: "Invalid ID",
        message: "the result ID provided is not valid."
      })
    }
    const result = await db.Result.findById(id);
    if (!result) {
      return res.status(400).json({
        info: "Result not found",
        message: "No result found with the provided ID."
      })
    }
    return res.status(200).json({ result })
  },
  //Upload result
  uploadResult: async (req, res) => {
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
        message: "Please upload at least one PDF or image file.",
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
            .on("finish", () => {
              convertedPDFPaths.push(filePath); // Store converted path
              resolve();
            })
            .on("error", (err) => reject(new Error(`Error converting images to PDF: ${err.message}`)));
        });
      }

      // Handle PDF files saving
      const savedPDFPaths = await Promise.all(
        pdfFiles.map((file) => {
          return new Promise((resolve, reject) => {
            file.mv(filePath, (err) => {
              // Overwriting if file exists
              if (err) reject(new Error(`Error moving PDF file: ${err.message}`));
              else resolve(filePath);
            });
          });
        })
      );

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
            file.mv(filePath, (err) => {
              // Overwriting the PDF file
              if (err) reject(new Error(`Error saving the PDF file: ${err.message}`));
              else resolve();
            });
          });
        } else if (mimeType.startsWith("image/")) {
          await new Promise((resolve, reject) => {
            imgToPDF([file.data], imgToPDF.sizes.A4)
              .pipe(fs.createWriteStream(filePath))
              .on("finish", resolve)
              .on("error", (err) => reject(new Error(`Error converting image to PDF: ${err.message}`)));
          });
        } else {
          return res.status(400).json({
            message: "Unsupported file type. Please upload a PDF or image file.",
          });
        }
      }

      // Use findOneAndUpdate to either create or update the result, ensuring uniqueness
      const result = await db.Result.findOneAndUpdate(
        { session, courseCode: formattedCourseCode, courseTitle },
        {
          staff: req.user.id,
          session,
          courseCode: formattedCourseCode,
          courseTitle: courseTitle.trim(),
          name: fileName,
          type: "application/pdf",
          url,
        },
        { new: true, upsert: true } // Create if not found
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
  },

  getCourses: async (req, res) => {
    const courses = await db.Course.find({});
    return res.status(200).json({ courses })
  },

  getUserFaceDescriptor: async (req, res) => {
    const { id } = req.user;
    if (!id) return res.status(400).json({
      info: "Failed",
      message: 'No ID provided'
    });

    const user = await db.User.findById(id).lean();
    if (!user) return res.status(400).json({
      info: "Not found",
      message: 'User not found. Check the username, email, registration number or staff ID provided'
    });
    const { faceDescriptor } = user;

    return res.status(200).json({ faceDescriptor });
  },

  getUserProfile: async (req, res) => {
    const user = await db.User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ info: "Not found", message: "User not found." });
    }
    delete user.password;
    delete user.faceDescriptors
    delete user.passkeys;
    delete user.options;

    return res.status(200).json(user);
  },

  changeImage: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        info: "Failed",
        message: 'No ID provided'
      });
    }
    if (!req.files || !Object.keys(req.files).length) {
      return res.status(400).json({
        info: "No files found",
        message: "Please upload an image.",
      });
    }

    const user = await db.User.findById(id);
    if (!user) {
      return res.status(404).json({ info: "Not found", message: "User not found." });
    }
    const uploadDir = path.resolve(`public/users/${user.role.toLowerCase().trim()}s`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const { file } = req.files;
    if (!file) {
      return res.status(400).json({
        info: "Failed",
        message: "No image found in the request.",
      });
    }
    const ext = file.name.split('.').pop();
    const fileName = `${user._id}-${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const url = `${req.protocol}://${req.get("host")}/users/${user.role.toLowerCase().trim()}s/${fileName}`;

    if (user.image) {
      fs.unlink(path.join(uploadDir, user.image.split("/").pop()), (err) => {
        if (err) {
          logger.info({
            message: "Error deleting user image",
            error: err.message,
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            timeStamp: Date.now()
          });
        }
      });
    }
    await Promise.all([
      file.mv(filePath),
      db.User.updateOne({ _id: id }, { $set: { image: url } }),
    ]);
    return res.status(200).json({ image: url });
  },

  verifyOldPassword: async (req, res) => {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        info: "Failed",
        message: "No password provided",
      });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        info: "Failed",
        message: "No ID provided",
      });
    }
    const user = await db.User.findById(id, { password: 1 }).lean();
    if (!user) {
      return res.status(404).json({ info: "Not found", message: "User not found." });
    }
    const verified = await bcrypt.compare(password, user.password);
    return res.status(200).json({ verified });
  },

  changePassword: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        info: "Failed",
        message: "No ID provided",
      });
    }
    const { passwords } = req.body;
   
    if (!passwords || !passwords.oldPassword ||!passwords.newPassword ||!passwords.confirmPassword) {
      return res.status(400).json({
        info: "Failed",
        message: "No passwords provided."
      })
    }
    const user = await db.User.findById(id, { password: 1 })
    if (!user) {
      return res.status(404).json({ info: "Not found", message: "User not found." });
    }

    const invalid = Object.keys(passwords).some(password => password.length < 8);
    if (invalid) {
      return res.status(400).json({
        info: "Failed",
        message: "Passwords must be at least 8 characters long."
      });
    }

    if (passwords.confirmPassword !== passwords.newPassword) {
      return res.status(400).json({
        info: "Passwords do not match",
        message: "Confirm your new password and try again."
      });
    }

    const verified = await bcrypt.compare(passwords.oldPassword, user.password);
    if (!verified) {
      return res.status(400).json({
        info: "Failed",
        message: "Old password is incorrect."
      });
    }
    const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({
      success: true,
      info: "Done",
      message: "Password changed successfully"
    })
  },

  updatePersonalDetails: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        info: "Failed",
        message: "No ID provided"
      });
    }
    const profile = req.body;
    if (!profile || !Object.keys(profile).length) {
      res.status(400).json({
        info: "Failed",
        message: "No profile data provided"
      });
    }

    let { title, firstName, lastName, sex } = profile;
    if (title) title = title.trim();
    if (firstName) firstName = firstName.trim();
    if (lastName) lastName = lastName.trim();
    if (sex) sex = sex.trim().toUpperCase();

    await db.User.updateOne({ _id: id }, { title, firstName, lastName, sex });
    return res.status(200).json({
      user: { title, firstName, lastName, sex },
      info: "Done",
      message: "Personal details updated successfully."
    })
  },

  updateAcademicDetails: async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        info: "Failed",
        message: "No ID provided"
      });
    }
    const profile = req.body;
    if (!profile || !Object.keys(profile).length) {
      res.status(400).json({
        info: "Failed",
        message: "No profile data provided"
      });
    }

    let { studentClass, level, role } = profile;

    const edit = role === "STUDENT" ? { level } : { studentClass }


    await db.User.updateOne({ _id: id }, edit);
    return res.status(200).json({
      user: { studentClass, level },
      info: "Done",
      message: "Academic details updated successfully."
    })
  },

  updateAccountDetails: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        info: "Failed",
        message: "No ID provided"
      });
    }

    const profile = req.body;

    if (!profile || !Object.keys(profile).length) {
      return res.status(400).json({
        info: "Failed",
        message: "No profile data provided"
      });
    }

    let { username, email } = profile;

    // Set empty strings to null to avoid saving them in the database
    username = username?.trim() === "" ? null : username;
    email = email?.trim() === "" ? null : email;

    const query = [];
    if (username) {
      query.push(db.User.findOne({ username, _id: { $ne: id } }));
    }
    if (email) {
      query.push(db.User.findOne({ email, _id: { $ne: id } }));
    }

    if (query.length > 0) {
      const results = await Promise.all(query);
      const [existingUserWithUsername, existingUserWithEmail] = results;

      if (existingUserWithUsername) {
        return res.status(400).json({
          info: "Failed",
          message: "This username is already in use."
        });
      }

      if (existingUserWithEmail) {
        return res.status(400).json({
          info: "Failed",
          message: "This email is already in use."
        });
      }
    }

    // Update the user while omitting empty strings
    const updateData = {};
    if (username !== null) updateData.username = username;
    if (email !== null) updateData.email = email;

    await db.User.updateOne({ _id: id }, updateData);

    return res.status(200).json({
      user: { username, email },
      info: "Success",
      message: "Account details updated successfully."
    });
  }
} 


module.exports = GeneralController;