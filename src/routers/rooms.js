import express from "express";
import { createRoom, generateToken } from "../controllers/rooms.js";
import { userAuth } from "../utils/Auth.js";

export const roomRouter = express.Router();

roomRouter.use(userAuth);

roomRouter.get("/:id/generate-token", generateToken);

roomRouter.post("/create-room", createRoom);
