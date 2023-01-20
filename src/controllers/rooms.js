import axios from "axios";
import { Rooms } from "../database/Rooms/index.js";
import generateUniqueString from "../utils/meetingIdGenerator.js";

export const generateToken = async (req, res) => {
  const roomId = req.params.id;

  const room = await Rooms.findOne({ meetingId: roomId });

  if (!room)
    return res.status(400).send({
      message:
        "Room does not exists, You need to create a room before generating a token",
    });

  return res.status(200).send({ token: room.token });
};

export const createRoom = async (req, res) => {
  const { name, personal } = req.name;

  const generateMeetToken = (room) => {
    return axios({
      url: `${process.env.MEET_URL}/generate-token`,
      data: {
        room,
      },
      headers: {
        Authorization: `Bearer ${process.env.CLIENT_TOKEN}`,
      },
    });
  };

  if (personal) {
    const personalMeetingId = req.user.meetingId;

    try {
      const response = await generateMeetToken(personalMeetingId);

      if (response.status !== 200) {
        return res.status(500).send({ message: "Something went wrong" });
      }

      const token = response.data.token;

      const room = await Rooms.findOneAndUpdate(
        { meetingId: req.user.meetingId },
        {
          name: name || req.user.meetingId,
          messages: [],
          participants: [],
          token,
          moderator: req.user._id,
        }
      );

      return res
        .status(200)
        .send({ message: "Room Created Successfully", data: room });
    } catch (e) {
      return res.status(500).send({ message: "Something went wrong" });
    }
  }

  const randomMeetingId = generateUniqueString(req.user.username);

  const room = new Rooms({
    name: name || randomMeetingId,
    moderator: req.user._id,
    token: await generateMeetToken(randomMeetingId),
    meetingId: randomMeetingId,
  });

  await room.save();

  res.status(200).send({ message: "Room Created Succesfully", data: room });
};
