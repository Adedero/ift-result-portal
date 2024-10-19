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
    },
    isUsed: {
      type: Boolean,
      required: true,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }, {
    timestamps: true
  });

  return {
    name: "Pin",
    schema: PinSchema
  };
};
