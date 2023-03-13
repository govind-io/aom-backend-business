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

RoomsSchema.virtual("roommessages", {
  ref: "Message",
  localField: "meetingId",
  foreignField: "meetingId",
});

RoomsSchema.methods.toJSON = function () {
  const room = this;
  const roomObject = room.toObject();
  delete roomObject.messages;

  return roomObject;
};

export const Rooms = mongoose.model("Rooms", RoomsSchema);
