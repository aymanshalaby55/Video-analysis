const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "user must have a username"],
    },
    email: {
      type: String,
      required: [true, "user must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "account must have a passowrd"],
      minLength: 8,
      select: false,
    },
    confirmPassword: {
      retuired: true,
      type: String,
      validate: {
        // this only works on save
        validator: function (val) {
          return this.password === val;
        },
        message: "password dosn't match",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    storageLimit: {
      type: Number,
      default: 2,
      // set: value => value * 1024 * 1024 * 1024, // 2GB
    },
    usedModels: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "AiModels",
      },
    ],
    dateOfBirth: {
      type: Date,
      required: [true, "user must have a date of birth"],
    },
    videos: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
