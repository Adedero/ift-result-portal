const db = require("../../../database/db");

module.exports = {
  fn: async (req, res) => {
    const courseReg = req.body;
    console.log(courseReg);

    courseReg.student = req.user.id;
    const record = await db.CourseRegistration.findOneAndUpdate(
      { student: req.user.id, session: courseReg.session, semester: courseReg.semester },
      { ...courseReg },
      { new: true, upsert: true }
    );

    return res.status(200).json({ info: "Success", record });
  }
}