module.exports = {
  fn: async (req, res) => {
    /* const { role } = req.query;
    if (!role) {
      return res.status(400).json({
        info: "Bad request",
        message: "Role parameter is required"
      })
    } */
    const user = req.body;
    if (!user) {
      return res.status(400).json({
        info: "Bad request",
        message: "No user details provided"
      })
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

    const { email, staffId, regNumber, username } = user;
    const query = {
      $or: [
        { email: email ?? "" },
        { staffId: staffId ?? "" },
        { regNumber: regNumber ?? "" },
        { username: username ?? "" }
      ]
    }

    const existingUser = await db.User.findOne(query, { email: 1, staffId: 1, regNumber: 1, username: 1 }).lean();
    if (existingUser) {
      let info = "Duplicate user";
      let message;
      const duplicateFields = Object.keys(existingUser).filter(key => existingUser[key] === user[key]);

      const duplicateFieldNames = duplicateFields.join(", ");
      message = `Users with this ${duplicateFieldNames} already exist.`;

      return res.status(400).json({
        success: false,
        info,
        message
      });
    }

    const hpassword = await bcrypt.hash(user.password, 10);
    const newUser = await db.User.create({
      ...user,
      password: hpassword
    })

    delete newUser.password;

    return res.status(200).json({
      success: true,
      info: "Done.",
      message: `User successfully created.`,
      user: newUser
    })
  }

}