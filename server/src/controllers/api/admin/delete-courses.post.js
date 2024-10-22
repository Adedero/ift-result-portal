const db = require("../../../database/db");

module.exports = {
  fn: async (req, res) => {
    const courses = req.body;

    if (!courses) {
      return res.status(400).json({
        info: "No courses provided",
        message: "Please select the courses to delete."
      })
    }

    const courseIds = courses.map(course => course._id);

    await db.Course.deleteMany({ _id: { $in: courseIds } });
    return res.status(200).json({
      success: true,
      info: "Done.",
      message: `Deleted courses.length ${courses.length === 1 ? 'course' : 'courses' }`
    })
  }
}