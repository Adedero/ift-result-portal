const db = require("../../../database/db");

module.exports = {
  params: ["id"],
  fn: async (req, res) => {
    const { user } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        info: "Bad request",
        message: "No user ID was supplied."
      });
    }

    if (!user) {
      return res.status(400).json({
        info: "Bad request",
        message: "No user data was supplied."
      });
    }
    delete user.password

    Object.keys(user).forEach(key => {
      user[key] = typeof user[key] === "string" ? user[key].trim() : user[key]
    });

    if (!user.email) delete user.email;
    if (!user.username) delete user.username;

    const { email, staffId, regNumber, username } = user;

    const query = [];

    if (email) query.push({ email });
    if (staffId) query.push({ staffId });
    if (regNumber) query.push({ regNumber });
    if (username) query.push({ username });

    const existingUser = await db.User.findOne({ $or: query, _id: { $ne: id } }, { email: 1, staffId: 1, regNumber: 1, username: 1 }).lean();
    if (existingUser) {
      let info = "Duplicate user";
      let message;
      const duplicateFields = Object.keys(existingUser).filter(key => existingUser[key] === user[key]);

      const duplicateFieldNames = duplicateFields.join(", or ");
      message = `${duplicateFieldNames.length === 1 ? 'Users' : 'A user'} with this ${duplicateFieldNames} already exist.`;

      return res.status(400).json({
        success: false,
        info,
        message
      });
    }

    await db.User.updateOne({ _id: id }, user);
    return res.status(200).json({
      info: "User updated successfully",
      user
    });
  }
}