const db = require("../../../database/db")

module.exports = {
  fn: async (req, res) => {
    const courseRegistrations = await db.CourseRegistration.find({ student: req.user.id }).lean();
    let results = {};

    courseRegistrations.forEach(record => {
      results[record.session] = [];
    });

    const sessionsAndCourses = courseRegistrations.map(record => ({
      session: record.session,
      courses: record.courses.map(course => course.code)
    }));

    const resultPromises = sessionsAndCourses.map(async ({ session, courses }) => {
      const courseResults = await Promise.all(courses.map(courseCode =>
        db.Result.findOne({ session, courseCode }).lean()
      ));
      const validResults = courseResults.filter(result => result !== null);
      results[session].push(...validResults);
    });

    await Promise.all(resultPromises);

    return res.status(200).json({ results })
  }
}