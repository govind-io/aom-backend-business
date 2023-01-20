//import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
//import { ACCESS_EXPIRY, REFRESH_EXPIRY } from "../../../config/constants";
// import bcrypt from "bcrypt";
// const secretkey = process.env.SECRET_KEY;
const UsersSchema = mongoose.Schema({
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
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  token: {
    type: String,
    unique: true,
  },
  meetingId: {
    type: String,
    unique: true,
  },
});

UsersSchema.virtual("room", {
  ref: "Room",
  localField: "_id",
  foreignField: "participants",
});

// //user generated instance methods here
// UsersSchema.methods.generateRefreshToken = async function () {
//   const user = this;
//   const refresh = jsonwebtoken.sign({ id: user._id.toString() }, secretkey, {
//     expiresIn: REFRESH_EXPIRY,
//   });

//   return { refresh };
// };

// UsersSchema.methods.generateAccessToken = async function () {
//   const user = this;

//   const access = jsonwebtoken.sign({ id: user._id.toString() }, secretkey, {
//     expiresIn: ACCESS_EXPIRY,
//   });

//   return { access };
// };

UsersSchema.methods.toJSON = function () {
  const user = this;
  const userobject = user.toObject();
  delete userobject.token;
  return userobject;
};

// UsersSchema.statics.findByCredentials = async function (email, password) {
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

// UsersSchema.pre("save", async function (next) {
//   const user = this;
//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });

export const Users = mongoose.model("Users", UsersSchema);
