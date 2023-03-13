import express from "express";
import { muteAll } from "../controllers/room/meetingManagement.js";
import { getMessages, sendMessage } from "../controllers/room/message.js";
import {
  createRoom,
  deleteRoom,
  generateToken,
  getRoomCountsByDate,
  getRooms,
} from "../controllers/room/room.js";
import { userAuth } from "../utils/Auth.js";

export const roomRouter = express.Router();

roomRouter.use(userAuth);

roomRouter.get("", getRooms);
roomRouter.post("/create-room", createRoom);
roomRouter.get("/rooms-count", getRoomCountsByDate);
roomRouter.delete("/:id", deleteRoom);
roomRouter.post("/:id/generate-token", generateToken);
roomRouter.post("/:id/message", sendMessage);
roomRouter.get("/:id/message", getMessages);
roomRouter.get("/:id/mute-all", muteAll);
