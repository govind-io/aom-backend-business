import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
import cors from "cors";
import { database } from "./database/index.js";
import { userRouter } from "./routers/users.js";
import { roomRouter } from "./routers/rooms.js";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __publicdir = path.join(__dirname, "../public");

export const app = express();

app.use(express.json());
app.use(express.static(__publicdir));

//allow cross origin
var whitelist = [process.env.MEET_FRONTEND_URL];

var corsOptions = {
  // origin: function (origin, callback) {
  //   if (whitelist.indexOf(origin) !== -1) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error("Not allowed by CORS"));
  //   }
  // },
};

app.use(cors(corsOptions));

app.use("/user", userRouter);
app.use("/room", roomRouter);

app.get("/healthcheck", async (req, res) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.MEET_FRONTEND_URL}`,
    });

    if (response.status !== 200) {
      return res
        .status(503)
        .send({ message: "Meet frontend service not active" });
    }
  } catch (e) {
    return res
      .status(503)
      .send({ message: "Meet frontend service not active" });
  }

  try {
    const response = await axios({
      method: "GET",
      url: `${process.env.MEET_URL}/healthcheck`,
    });

    if (response.status !== 200) {
      return res
        .status(503)
        .send({ message: "Meet backend service not active" });
    }
  } catch (e) {
    return res.status(503).send({ message: "Meet backend service not active" });
  }

  if (mongoose.connection.readyState === 1) {
    return res.status(200).send("Ok");
  }
  return res.status(503).send("Database not connected");
});

app.get("*", async (req, res) => {
  res.status(404).send("Not found");
});
