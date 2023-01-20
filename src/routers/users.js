import express from "express";
import { getUserData } from "../controllers/users.js";
import { userAuth } from "../utils/Auth.js";

export const userRouter = express.Router();

userRouter.use(userAuth);

userRouter.get("/", getUserData);
