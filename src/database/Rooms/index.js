//import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
//import { ACCESS_EXPIRY, REFRESH_EXPIRY } from "../../../config/constants";
// import bcrypt from "bcrypt";
// const secretkey = process.env.SECRET_KEY;
const RoomsSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: (val) => {
      if (val.length < 6) {
        throw new Error("Name should be minimum 6 character long");
      }
    },
  },
  meetingId: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  messages: [{ type: String }],
  token: { type: String, required: true },
  moderator: { type: mongoose.Schema.Types.ObjectId, required: true },
});

// //user generated instance methods here
// RoomsSchema.methods.generateRefreshToken = async function () {
//   const user = this;
//   const refresh = jsonwebtoken.sign({ id: user._id.toString() }, secretkey, {
//     expiresIn: REFRESH_EXPIRY,
//   });

//   return { refresh };
// };

// RoomsSchema.methods.generateAccessToken = async function () {
//   const user = this;

//   const access = jsonwebtoken.sign({ id: user._id.toString() }, secretkey, {
//     expiresIn: ACCESS_EXPIRY,
//   });

//   return { access };
// };

// RoomsSchema.statics.findByCredentials = async function (email, password) {
//   let user = await User.findOne({ email });

//   if (!user) {
//     throw new Error("no such user found");
//   }
//   const ismatch = await bcrypt.compare(password, user.password);

//   if (!ismatch) {
//     throw new Error("Login error");
//   }

//   return user;
// };

// RoomsSchema.pre("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });

export const Rooms = mongoose.model("Rooms", RoomsSchema);
