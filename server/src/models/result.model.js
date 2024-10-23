module.exports = (mongoose) => {
  const ResultSchema = new mongoose.Schema({
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    session: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    courseCode: {
      type: String,
      required: true
    },
    courseTitle: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      required: true,
      enum: ["HARMATTAN", "RAIN"]
    },
    type: {
      type: String,
      required: true
    }
  }, {
    timestamps: true
  });

  ResultSchema.pre("save", function(next) {
    const courseParts = this.courseCode.split("-");
    if (courseParts.length !== 2) {
      return next(new Error("Invalid course code format"));
    }

    const courseCodeNumber = courseParts[1];
    const num = parseInt(courseCodeNumber, 10);
    if (isNaN(num)) {
      return next(new Error("Course code number is not a valid number"));
    }

    this.semester = (num % 2 === 0) ? "RAIN" : "HARMATTAN";
    next();
  })

  ResultSchema.pre("find", function (next) {
    this.sort({ createdAt: -1 });
    next();
  })


  return {
    name: "Result",
    schema: ResultSchema
  };
};
