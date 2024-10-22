module.exports = (mongoose) => {
  const PinSchema = new mongoose.Schema({
    value: {
      type: String,
      required: true,
      unique: true
    },
    role: {
      type: String,
      enum: ["ADMIN", "STAFF", "STUDENT"],
      required: true
    },
    validity: {
      type: Date,
      required: true
    }
  }, {
    timestamps: true
  });

  return {
    name: "Pin",
    schema: PinSchema
  };
};
