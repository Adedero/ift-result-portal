const db = require("../../../database/db");

module.exports = {
  fn: async (req, res) => {
    const courseReg = req.body;
    const { session, semester, courses } = courseReg;

    if (!session || !semester || !(courses.length > 0)) {
      return res.status(400).json({
        info: "Could not complete course registration",
        message: "Session, semester, and courses are reuired."
      });
    }
    courseReg.student = req.user.id;
    const record = await db.CourseRegistration.findOneAndUpdate(
      { student: req.user.id, session: courseReg.session, semester: courseReg.semester },
      { ...courseReg },
      { new: true, upsert: true }
    );

    return res.status(200).json({ info: "Success", record });
  }
}