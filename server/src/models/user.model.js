module.exports = (mongoose) => {
  const UserSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50
    },
    username: {
      type: String,
      unique: true,
      index: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      index: true,
      sparse: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 100
    },
    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "STAFF", "STUDENT"]
    },
    image: {
      type: String
    },
    sex: {
      type: String,
      enum: ["FEMALE", "MALE"]
    },
    staffId: {
      type: String,
      unique: true,
      index: true,
      sparse: true
    },
    studentClass: {
      type: String
    },
    regNumber: {
      type: String,
      unique: true,
      index: true,
      sparse: true
    },
    level: {
      type: Number,
    },
    faceDescriptor: {
      descriptor: Object,
      createdAt: Date
    },
    passkeys: {
      type: Array,
      default: []
    },
    options: {
      type: Object
    },
  }, {
    timestamps: true
  });
  
  return {
   name: "User",
   schema: UserSchema
  };
};
