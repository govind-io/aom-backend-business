import express from "express";
import { generateToken } from "../controllers/rooms.js";
import { userAuth } from "../utils/Auth.js";

export const roomRouter = express.Router();

roomRouter.use(userAuth);

roomRouter.post("/:id/generate-token", generateToken);
