require("dotenv").config();
const db = require("../../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isPinExpired = require("../../utils/validate-pin");

module.exports = {
  fn: async (req, res) => {
    let { user, pin } = req.body;

    pin.value = pin.value.trim();
    if (!pin.value) {
      return res.status(400).json({
        success: false,
        info: "Missing Pin",
        message: "You need to provide a pin to complete the registration."
      })
    }
    const existingPin = await db.Pin.findOne({ value: pin.value }).lean();
    if (!existingPin) {
      return res.status(400).json({
        success: false,
        info: "Invalid Pin",
        message: "The provided pin is not valid.",
        pin: {
          isValid: false
        }
      });
    }
    const isExpired = isPinExpired(existingPin.validity);
    if (isExpired) {
      await db.Pin.deleteOne({ value: existingPin.value });
      return res.status(400).json({
        success: false,
        info: "Pin Expired",
        message: "The provided pin has expired. Contact the admin office to generate a new one.",
        pin: {
          isValid: false
        }
      });
    }

    Object.keys(user).forEach(key => {
      user[key] = typeof user[key] === "string" ? user[key].trim() : user[key]
    });

    if (user.password.length < 8) {
      return res.status(400).json({
        success: false,
        info: "Failed",
        message: "Password must be at least 8 characters."
      });
    }

    if (user.confirmPassword !== user.password) {
      return res.status(400).json({
        success: false,
        info: "Failed",
        message: "Password do not match."
      });
    }

    const newUser = {
      ...user,
      sex: user.sex.toUpperCase(),
      role: pin.role
    }
    const { staffId, regNumber, username } = newUser;
    const query = {}
    let key;

    if (pin.role === 'ADMIN') {
      query.username = username;
      key = "username"
    };
    if (pin.role === 'STAFF') {
      query.staffId = staffId;
      key = "staff ID"
    };
    if (pin.role === 'STUDENT') {
      query.regNumber = regNumber;
      key = "registration number"
    };

    const existingUser = await db.User.findOne(query).lean();
    if (existingUser) {
      const message = `Another ${pin.role.toLowerCase()} with this ${key} aleady exists.`
      return res.status(400).json({
        success: false,
        info: 'Duplicate user',
        message
      });
    }

    const hpassword = await bcrypt.hash(user.password, 10);
    const [createdUser] = await Promise.all([
      db.User.create({
        ...newUser,
        password: hpassword
      }),
      db.Pin.deleteOne({ value: pin.value })
    ]);

    const token = jwt.sign({ id: createdUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({
      success: true,
      info: "Registration successful",
      message: `Your ${createdUser.role.toLowerCase()} account has been created successfully.`,
      user: {
        id: createdUser._id,
        title: createdUser.title,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        isEmailVerified: createdUser.isEmailVerified,
        role: createdUser.role,
        sex: createdUser.sex,
        username: createdUser.username,
        staffId: createdUser.staffId,
        regNumber: createdUser.regNumber,
        username: createdUser.username,
        studentClass: createdUser.studentClass,
        image: createdUser.image,
        level: createdUser.level,
        token: token
      }
    })
  }
}