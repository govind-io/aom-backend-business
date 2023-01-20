import jwt from "jsonwebtoken";
import { Users } from "../database/Users/index.js";
import generateUniqueString from "./meetingIdGenerator.js";

export const userAuth = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "unauthorized access" });

  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);

    if (!user) return res.status(401).send({ message: "unauthorized access" });

    const username = user.username;

    const existingUser = await Users.findOne({ username: username });

    req.user = existingUser;

    if (!existingUser && username) {
      const newUser = new Users({
        username,
        name: user.name || user.username,
        token,
        meetingId: generateUniqueString(user.username),
      });

      await newUser.save();

      req.user = newUser;
    }

    if (!existingUser && !username) {
      //getUsername from server and save it
    }

    next();
  } catch (e) {
    res.status(401).send({ message: "unauthorized access" });
  }
};
