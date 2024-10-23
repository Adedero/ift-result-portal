const db = require("../../../database/db");

module.exports = {
  fn: async (req, res) => {
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({
        info: "No course provided",
        message: "You must provide a course tobe added."
      })
    }

    if (!course.code || !course.title) {
      return res.status(400).json({
        info: "Missing fields",
        message: "Course code and title are required."
      })
    }

    const existingCourse = await db.Course.findOne({ code: course.code }).lean();

    if (existingCourse) {
      return res.status(400).json({
        info: "Dupicate course",
        message: "Another course with this code already exists."
      })
    }

    course.code = course.code.toUpperCase().trim();
    course.title = course.title.trim();

    const newCourse = new db.Course(course);
    await newCourse.save();
    return res.status(200).json({
      info: "Done",
      message: "Course created successfully.",
      course: newCourse
    })
  }
}