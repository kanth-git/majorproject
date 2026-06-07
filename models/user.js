const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let passportLocalMongoose = require("passport-local-mongoose");
if (passportLocalMongoose && typeof passportLocalMongoose !== 'function' && typeof passportLocalMongoose.default === 'function') {
  passportLocalMongoose = passportLocalMongoose.default;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String
  }
});

if (typeof passportLocalMongoose !== 'function') {
  throw new Error('passport-local-mongoose plugin is not a function');
}

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
module.exports = mongoose.model("User", userSchema);