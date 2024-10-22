module.exports = (mongoose) => {
  const OtpSchema = new mongoose.Schema({
    value: {
      type: Number,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    name: "Otp",
    schema: OtpSchema
  };
};
