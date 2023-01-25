import axios from "axios";
import { Rooms } from "../database/Rooms/index.js";
import generateUniqueString from "../utils/meetingIdGenerator.js";

export const generateToken = async (req, res) => {
  const roomId = req.params.id;

  const room = await Rooms.findOne({ meetingId: roomId });

  if (!room)
    return res.status(404).send({
      message:
        "Room does not exists, You need to create a room before generating a token",
    });

  const formattedData = await room.populate("participants moderator");

  return res.status(200).send({
    data: formattedData,
    message: "Room Found Succesfully",
  });
};

export const createRoom = async (req, res) => {
  const { name, personal } = req.body;

  const generateMeetToken = (room) => {
    return axios({
      url: `${process.env.MEET_URL}/generate-token`,
      data: {
        room,
      },
      headers: {
        Authorization: `${process.env.CLIENT_TOKEN}`,
      },
      method: "POST",
    });
  };

  if (personal) {
    const personalMeetingId = req.user.meetingId.toUpperCase();

    try {
      const response = await generateMeetToken(personalMeetingId);

      if (response.status !== 200) {
        return res.status(500).send({ message: "Something went wrong" });
      }

      const token = response.data.token;

      let room = await Rooms.findOne({ meetingId: personalMeetingId });

      if (room) {
        room.participants = [req.user._id];
        room.messages = [];
        room.name = name || personalMeetingId;
        room.token = token;
        room.moderator = req.user._id;

        await room.save();
      } else {
        room = new Rooms({
          name: name || personalMeetingId,
          messages: [],
          participants: [req.user._id],
          token,
          moderator: req.user._id,
          meetingId: personalMeetingId,
        });

        await room.save();
      }
      return res
        .status(200)
        .send({ message: "Room Created Successfully", data: room });
    } catch (e) {
      return res.status(500).send({ message: "Something went wrong" });
    }
  }

  const randomMeetingId = generateUniqueString(req.user.username).toUpperCase();

  try {
    const response = await generateMeetToken(randomMeetingId);

    if (response.status !== 200) {
      return res.status(500).send({ message: "Something went wrong" });
    }

    const token = response.data.token;

    const room = new Rooms({
      name: name || randomMeetingId,
      moderator: req.user._id,
      token,
      meetingId: randomMeetingId,
      participants: [req.user._id],
      messages: [],
    });

    await room.save();

    res.status(200).send({ message: "Room Created Successfully", data: room });
  } catch (e) {
    console.log("error occured", e.message);
    return res.status(500).send({ message: "Something went wrong" });
  }
};
