import { Users } from "../database/Users/index.js";
import GetUser from "./GetUser.js";
import generateRandomString from "./meetingIdGenerator.js";
export const userAuth = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "unauthorized access" });

  try {
    let user = await GetUser(token);

    if (!user) return res.status(401).send({ message: "unauthorized access" });

    const user_id = user.user_id;

    const existingUser = await Users.findOne({ userId: user_id });

    req.user = existingUser;

    if (existingUser && existingUser.username !== user.username) {
      const updatedUser = await Users.findOneAndUpdate(
        { userId: user_id },
        { username: user.username }
      );

      req.user = updatedUser;
    }

    if (!existingUser) {
      const newUser = new Users({
        username: user.username,
        userId: user.user_id,
        name: user.name || "",
        token,
        meetingId: generateRandomString(user.username).toUpperCase(),
      });

      await newUser.save();

      req.user = newUser;
    }

    next();
  } catch (e) {
    console.log({ e });
    res.status(401).send({ message: "unauthorized access" });
  }
};
