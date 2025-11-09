// const mongoose=require('mongoose');

// const userSchema=new mongoose.Schema({
//     email:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     fullName:{
//         firstName:{
//             type:String,
//             required:true
//         },
//         lastName:{
//             type:String,
//             required:true   
//         }

//     },
//     password:{
//         type:String
//     }
// },{
//     timestamps:true
// });

// const userModel=mongoose.model('user',userSchema);
// module.exports=userModel;

const mongoose = require("mongoose");
const crypto = require("crypto");    // ✅ IMPORTED
const bcrypt = require("bcryptjs");  // ✅ IMPORTED

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// ✅ Password hashing before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // ✅ Only hash if modified
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Method to generate token
userSchema.methods.getResetToken = function () {
  const token = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min expiry

  return token;
};

// ✅ Method to compare password
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
