const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    Firstname: String,
    Lastname: String,
    Email: String,
    Password: String,
    UserType: String,
    UserName: {
      type: String,
      unique: true,
    },
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User; 



 








