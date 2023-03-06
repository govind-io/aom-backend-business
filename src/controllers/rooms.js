import axios from "axios";
import { Rooms } from "../database/Rooms/index.js";
import { StringToISO } from "../utils/DateUtils.js";
import { getRoomsCountForMonthAndModerator } from "../utils/GetRoomCountForMonth.js";
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

  const formattedData = await room.populate("moderator");

  res.status(200).send({
    data: formattedData,
    message: "Room Found Succesfully",
  });

  if (!room.participants.includes(req.user._id)) {
    room.participants = room.participants.concat(req.user._id);

    try {
      // Save the updated room with the __v field
      room = await room.save();
    } catch (err) {
      // Handle concurrent updates by merging changes
      if (err.name === "VersionError") {
        // Fetch the latest version of the document
        const latestRoom = await Rooms.findOne({ meetingId: roomId });

        // Merge changes made by the current user with the latest version of the document
        latestRoom.participants = Array.from(
          new Set([...latestRoom.participants, ...room.participants])
        );

        // Save the merged document with the __v field
        room = await latestRoom.save();
      } else {
        throw err;
      }
    }
  }

  return;
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
        room.name = name;
        room.token = token;
        room.moderator = req.user._id;
        room.passcode = passcode;
        room.pin = passcode ? pin : undefined;
        room.start = start;
        room.end = end;
        room.deleted = false;

        await room.save();
      } else {
        room = new Rooms({
          name: name,
          messages: [],
          participants: [req.user._id],
          token,
          moderator: req.user._id,
          meetingId: personalMeetingId,
          passcode,
          pin: passcode ? pin : undefined,
          start,
          end,
          deleted: false,
        });

        await room.save();
      }
      const formattedData = await room.populate("moderator");
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
      name: name,
      moderator: req.user._id,
      token,
      meetingId: randomMeetingId,
      participants: [req.user._id],
      messages: [],
      passcode,
      pin: passcode ? pin : undefined,
      start,
      end,
      deleted: false,
    });

    await room.save();
    const formattedData = await room.populate("moderator");
    res
      .status(200)
      .send({ message: "Room Created Successfully", data: formattedData });
  } catch (e) {
    console.log("error occured", e.message);
    return res.status(500).send({ message: "Something went wrong" });
  }
};

export const getRooms = async (req, res) => {
  try {
    const startDate = StringToISO(req.query.startDate);
    const nextDay = new Date(startDate);
    nextDay.setTime(nextDay.getTime() + 24 * 60 * 60 * 1000);

    const rooms = await Rooms.find({
      start: {
        $gte: startDate,
        $lt: nextDay.toISOString(),
      },
      moderator: req.user._id,
    }).populate("moderator");

    res.status(200).send({ data: rooms, message: "Rooms fetched succefully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: "Something went wrong" });
  }
};

export const deleteRoom = async (req, res) => {
  const roomId = req.params.id;

  const room = await Rooms.findOne({ meetingId: roomId });

  if (!room || room.deleted)
    return res.status(404).send({ message: "Room not Found" });

  if (!room.moderator.equals(req.user._id)) {
    return res.status(400).send({ message: "Unauthorized access" });
  }

  room.deleted = true;

  await room.save();

  return res.status(200).send({ message: "Meeting deleted succesfully" });
};

export const getRoomCountsByDate = async (req, res) => {
  const month = req.query.month;

  if (month <= 0 && month > 12) {
    return res.status;
  }

  const count = await getRoomsCountForMonthAndModerator(
    parseInt(month),
    req.user._id
  );

  return res
    .status(200)
    .send({ data: count, message: "Counts extracted succesfully" });
};
