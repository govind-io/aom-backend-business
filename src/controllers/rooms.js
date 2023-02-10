import axios from "axios";
import mongoose from "mongoose";
import { Rooms } from "../database/Rooms/index.js";
import generateUniqueString from "../utils/meetingIdGenerator.js";

export const generateToken = async (req, res) => {
  const roomId = req.params.id;
  const { pin } = req.body;

  const room = await Rooms.findOne({ meetingId: roomId });

  if (!room || room.deleted)
    return res.status(404).send({
      message:
        "Room does not exists, You need to create a room before generating a token",
    });

  if (room.passcode) {
    if (room.pin.toLowerCase() !== pin?.toLowerCase()) {
      return res.status(400).send({ message: "Incorrect Passcode" });
    }
  }

  if (!room.participants.includes(req.user._id)) {
    room.participants = room.participants.concat(req.user._id);

    await room.save();
  }

  const formattedData = await room.populate("participants moderator");

  return res.status(200).send({
    data: formattedData,
    message: "Room Found Succesfully",
  });
};

export const createRoom = async (req, res) => {
  const { name, personal, passcode, pin, start, end } = req.body;

  if (passcode && !pin) {
    return res
      .status(400)
      .send({ message: "Passcode is required when passcode is enabled" });
  }

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
        room.passcode = passcode;
        room.pin = passcode ? pin : undefined;
        room.start = start;
        room.end = end;

        await room.save();
      } else {
        room = new Rooms({
          name: name || personalMeetingId,
          messages: [],
          participants: [req.user._id],
          token,
          moderator: req.user._id,
          meetingId: personalMeetingId,
          passcode,
          pin: passcode ? pin : undefined,
          start,
          end,
        });

        await room.save();
      }
      const formattedData = await room.populate("participants moderator");
      return res
        .status(200)
        .send({ message: "Room Created Successfully", data: formattedData });
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
      passcode,
      pin: passcode ? pin : undefined,
      start,
      end,
    });

    await room.save();
    const formattedData = await room.populate("participants moderator");
    res
      .status(200)
      .send({ message: "Room Created Successfully", data: formattedData });
  } catch (e) {
    console.log("error occured", e.message);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const deleteRoom = async (req, res) => {
  const roomId = req.params.id;

  console.log({ roomId });

  const room = await Rooms.findOne({ meetingId: roomId });

  if (!room || room.deleted)
    return res.status(404).send({ message: "Room not Found" });

  if (!room.moderator.equals(req.user._id)) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  room.deleted = true;

  await room.save();

  return res.status(200).send({ message: "Meeting deleted succesfully" });
};
