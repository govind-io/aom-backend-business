import mongoose from "mongoose";
const RoomsSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
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
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Users",
  },
  pin: { type: String },
  passcode: { type: Boolean },
  start: { type: Date },
  end: { type: Date },
  deleted: {
    type: Boolean,
    default: false,
  },
});

export const Rooms = mongoose.model("Rooms", RoomsSchema);
