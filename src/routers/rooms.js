import express from "express";
import { createRoom, deleteRoom, generateToken } from "../controllers/rooms.js";
import { userAuth } from "../utils/Auth.js";

export const roomRouter = express.Router();

roomRouter.use(userAuth);

roomRouter.post("/:id/generate-token", generateToken);

roomRouter.post("/create-room", createRoom);

roomRouter.delete("/:id", deleteRoom);
