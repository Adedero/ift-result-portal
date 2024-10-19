const db = require("../../../database/db")

module.exports = {
  fn: async (req, res) => {
    const data = await db.CourseRegistration.find({ student: req.user.id }).lean();

    if (data.length) {
      data.sort((a, b) => {
        if (parseInt(a.session.split("-")[0]) === parseInt(b.session.split("-")[0])) {
          return a.semester.localeCompare(b.semester.localeCompare)
        } else {
          return parseInt(a.session.split("-")[0]) - parseInt(b.session.split("-")[0])
        }
      });
    }
    return res.status(200).json({
      courseRegistrations: data
    })
  }
}