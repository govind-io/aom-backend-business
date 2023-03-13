import mongoose from "mongoose";
const MessagesSchema = mongoose.Schema({
  message: {
    type: String,
    trim: true,
  },
  by: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" },
  meetingId: {
    type: String,
    required: true,
    ref: "Rooms",
  },
  created_at: { type: Date, required: true },
});

MessagesSchema.methods.toJSON = function () {
  const message = this;
  const messageObject = message.toObject();
  delete messageObject.meetingId;

  return messageObject;
};

export const Messages = mongoose.model("Messages", MessagesSchema);
