const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
  },
  uid: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "email field is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide valid email"],
  },
  password: String,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    required: true,
    default: "user",
  },
  deleted: {
    type: Boolean,
    default: false,
    required: true,
    select: false,
  },
  blocked: {
    type: Boolean,
    default: false,
    required: true,
  },
  customerId: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// encrpt the password
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();
  // hash the password
  this.password = await bcrypt.hash(this.password, 12);
  // delete password confirm
  this.passwordConfirm = undefined;
  next();
});

// set password changed at
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
// compare password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// check user change password
userSchema.methods.changedPassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // false mean not change

  return false;
};

// generate reset token
userSchema.methods.resetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  // encrpt the reset token and save into the database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = User = mongoose.model("user", userSchema);
