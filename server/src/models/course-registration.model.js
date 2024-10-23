module.exports = (mongoose) => {
  const CourseRegistrationSchema = new mongoose.Schema({
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    session: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    courses: [
      {
        code: String,
        title: String,
        level: Number
      }
    ]
  }, {
    timestamps: true
  });



  return {
    name: "CourseRegistration",
    schema: CourseRegistrationSchema
  };
};
