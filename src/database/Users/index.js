//import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
//import { ACCESS_EXPIRY, REFRESH_EXPIRY } from "../../../config/constants";
// import bcrypt from "bcrypt";
// const secretkey = process.env.SECRET_KEY;
const UsersSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  token: {
    type: String,
    unique: true,
    required: true,
  },
  meetingId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: { type: String, unique: true, required: true },
});

UsersSchema.virtual("roomasparticipant", {
  ref: "Room",
  localField: "_id",
  foreignField: "participants",
});

UsersSchema.virtual("roomasmoderator", {
  ref: "Room",
  localField: "_id",
  foreignField: "moderator",
});

UsersSchema.methods.toJSON = function () {
  const user = this;
  const userobject = user.toObject();
  delete userobject.token;
  return userobject;
};

export const Users = mongoose.model("Users", UsersSchema);
