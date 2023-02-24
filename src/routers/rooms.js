import express from "express";
import {
  createRoom,
  deleteRoom,
  generateToken,
  getRoomCountsByDate,
  getRooms,
} from "../controllers/rooms.js";
import { userAuth } from "../utils/Auth.js";

export const roomRouter = express.Router();

roomRouter.use(userAuth);

roomRouter.get("", getRooms);
roomRouter.post("/create-room", createRoom);
roomRouter.get("/rooms-count", getRoomCountsByDate);
roomRouter.post("/:id/generate-token", generateToken);
roomRouter.delete("/:id", deleteRoom);
