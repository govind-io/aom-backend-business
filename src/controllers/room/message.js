import { Messages } from "../../database/messages.js";
import { RoomManager } from "../../utils/MeetingConstants.js";

export const sendMessage = async (req, res) => {
  const roomId = req.params.id;
  const { message } = req.body;
  const by = req.user._id;
  const created_at = new Date().getTime();

  if (!message)
    return res.status(400).send({ message: "message can not be empty" });

  try {
    const participant = await RoomManager.getParticipant(
      roomId,
      req.user.username
    );

    if (!participant) {
      return res
        .status(400)
        .send({ message: "Please join room before trying to send messages" });
    }

    const newMessage = new Messages({
      meetingId: roomId,
      by,
      message,
      created_at,
    });

    await newMessage.save();

    return res.status(200).send({ message: "Messages stored succesfully" });
  } catch (e) {
    const response = e.response;

    if (response?.status === 404) {
      return res
        .status(400)
        .send({ message: "Please join room before trying to send messages" });
    }

    return res.status(400).send({ message: e.message });
  }
};

export const getMessages = async (req, res) => {
  const roomId = req.params.id;

  try {
    const participant = await RoomManager.getParticipant(
      roomId,
      req.user.username
    );

    if (!participant) {
      return res
        .status(400)
        .send({ message: "Please join room before trying to fetch messages" });
    }

    const count = await Messages.countDocuments({ meetingId: roomId });

    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const messages = await Messages.find({ meetingId: roomId })
      .sort({ created_at: -1 })
      .limit(limit)
      .skip(skip)
      .populate("by");

    return res.status(200).send({
      message: "Messages fetched succesfully",
      data: { messages, count },
    });
  } catch (e) {
    const response = e.response;

    if (response?.status === 404) {
      return res
        .status(400)
        .send({ message: "Please join room before trying to fetch messages" });
    }

    return res.status(400).send({ message: e.message });
  }
};
