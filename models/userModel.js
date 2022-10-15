const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// name, email, photo(string), password, passwordConfirm
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    validate: {
      validator: function (val) {
        return validator.isAlphanumeric(val, 'en-US');
      },
      message: 'Username can use a-z letters and numbers, no space allowed ',
    },
  },
  email: {
    type: String,
    required: [true, 'User must have email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email address'], // <-shorthand
    // validate: { // <- long version
    //   validator: (val) => validator.isEmail(val),
    //   message: 'Invalid email address',
    // },
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: [8, 'Password should be at least 6 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE! For some update there should be different validator somewhere
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not equal! 😂😂😂',
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run when password is modified
  if (!this.isModified('password')) return next();

  // Encrypting password with cost of 12 (higher value - longer hash but higher CPU usage)
  this.password = await bcrypt.hash(this.password, 12);
  // deleting passwordConfirm (entire property for this document )
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000; // -1000 is setting time a bit earlier to avoid possible lag
  next();
});

// QUERY MIDDLEWARE
userSchema.pre(/^find/, function (next) {
  //this points to current query
  this.find({ active: { $ne: false } });
  next();
});

// Instance method - method that will work on all documents
userSchema.methods.correctPassword = async function (
  candidatepassword,
  userPassword
) {
  return await bcrypt.compare(candidatepassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
