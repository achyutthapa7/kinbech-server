import mongoose from "mongoose";
const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "others"],
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // select: false,
  },
  verificationCode: {
    type: String,
  },
  verificationCodeExpiry: {
    type: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
});
export const userModel = mongoose.model("user_details", userSchema);
