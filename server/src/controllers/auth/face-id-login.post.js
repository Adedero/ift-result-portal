module.exports = {
  params: ["id"],
  fn: async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        info: "Authentication failed.",
        message: "Try again or log in with your password instead."
      });
    }

    const user = await db.User.findById(id).lean();
    if (!user) {
      return res.status(400).json({
        success: false,
        info: "Authentication failed.",
        message: 'Try again or log in with your password instead.',
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({
      success: true,
      info: "Login successful.",
      message: "User logged in successfully.",
      user: {
        id: user._id,
        title: user.title,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        staffId: user.staffId,
        studentClass: user.studentClass,
        regNumber: user.regNumber,
        sex: user.sex,
        image: user.image,
        level: user.level,
        token: token,
        faceDescriptor: user.faceDescriptor
      }
    });
  }
}