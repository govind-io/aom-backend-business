import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import { database } from "./database/index.js";
import jsonwebtoken from "jsonwebtoken";
import { userRouter } from "./routers/users.js";
import { roomRouter } from "./routers/rooms.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __publicdir = path.join(__dirname, "../public");

export const app = express();

app.use(express.json());
app.use(express.static(__publicdir));

//allow cross origin
app.use(cors());

app.use("/user", userRouter);
app.use("/room", roomRouter);

app.get("/healthcheck", (req, res) => {
  if (mongoose.connection.readyState === 1) {
    return res.status(200).send("Ok");
  }
  return res.status(503).send("Database not connected");
});

app.get("*", async (req, res) => {
  res.status(404).send("Not found");
});
