module.exports = (mongoose) => {
  const CourseSchema = new mongoose.Schema({
    code: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      required: true,
      enum: ['HARMATTAN', 'RAIN']
    },
    level: {
      type: Number,
      required: true,
      enum: [100, 200, 300, 400, 500, 600, 700]
    }
  }, {
    timestamps: true
  });


  CourseSchema.pre("save", function (next) {
    const courseParts = this.code.split("-");
    if (courseParts.length !== 2) {
      return next(new Error("Invalid course code format"));
    }

    const courseCodeNumber = courseParts[1];
    const num = parseInt(courseCodeNumber, 10);
    if (isNaN(num)) {
      return next(new Error("Course code number is not a valid number"));
    }

    this.semester = (num % 2 === 0) ? "RAIN" : "HARMATTAN";
    this.level = Math.floor(num / 100) * 100;
    next();
  })

  CourseSchema.pre("find", function (next) {
    this.sort({ code: 'asc' });
    next();
  })


  return {
    name: "Course",
    schema: CourseSchema
  };
};
