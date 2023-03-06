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

RoomsSchema.methods.toJSON = function () {
  const room = this;
  const roomObject = room.toObject();
  delete roomObject.participants;
  delete roomObject.messages;

  return roomObject;
};

export const Rooms = mongoose.model("Rooms", RoomsSchema);
