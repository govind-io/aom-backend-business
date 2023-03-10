import { Rooms } from "../database/Rooms/index.js";
import { StringToISO } from "../utils/DateUtils.js";
import { getRoomsCountForMonthAndModerator } from "../utils/GetRoomCountForMonth.js";
import generateUniqueString from "../utils/meetingIdGenerator.js";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

const RoomManager = new RoomServiceClient(
  process.env.MEET_URL,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

const getMeetToken = ({ identity, roomId, name }) => {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity,
      name,
    }
  );

  at.addGrant({
    roomJoin: true,
    room: roomId,
    canPublish: true,
    canSubscribe: true,
  });

  const token = at.toJwt();

  return token;
};

export const generateToken = async (req, res) => {
  const roomId = req.params.id;
  const { pin, name } = req.body;

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

  let formattedData = await room.populate("moderator");

  formattedData = formattedData.toJSON();

  const token = getMeetToken({
    identity: `${req.user.username}-${name || req.user.username}`,
    roomId: roomId,
    name,
  });

  formattedData.token = token;

  res.status(200).send({
    data: formattedData,
    message: "Room Found Succesfully",
  });

  return;
};

export const createRoom = async (req, res) => {
  const { name, personal, passcode, pin, start, end } = req.body;

  if (passcode && !pin) {
    return res
      .status(400)
      .send({ message: "Passcode is required when passcode is enabled" });
  }

  if (personal) {
    const personalMeetingId = req.user.meetingId.toUpperCase();

    let room = await Rooms.findOne({ meetingId: personalMeetingId });

    if (room) {
      room.participants = [req.user._id];
      room.messages = [];
      room.name = name;
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
  }

  const randomMeetingId = generateUniqueString(req.user.username).toUpperCase();

  const room = new Rooms({
    name: name,
    moderator: req.user._id,
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
  try {
    await RoomManager.deleteRoom(room.meetingId);

    await room.save();

    return res.status(200).send({ message: "Meeting deleted succesfully" });
  } catch (e) {
    return res.status(500).send({ message: "Something went wrong" });
  }
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
