import jwt from "jsonwebtoken";
import { Users } from "../database/Users/index.js";
import generateUniqueString from "./meetingIdGenerator.js";
import jose from "node-jose";

const secretKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQCVERnsVhqwj+nq846JoEMJMWvlanmTDL17w0QBaxJ+IKz8zIU+
EhzpJ4F8i1DXTrKa0y+b0+NrILCclmyWqKMV1p0Yh5wCyttp/FuWKyFLhH/jef15
Zbdee1wh2g8V+sXCDd+uhHjTLfq2JJ1JNNHgbSUFupSyZPMALU2aydgicwIDAQAB
AoGAF2swX2jHmKWDYl4RLp326iLRiKFJqEiAHEl5DZ/8r8QCaVTYOgAuepKyTRa2
BJ1ggeJbwGdxewsPtAoN1T15IV/MsLvDnLQ/fMt9pxUxQe6HV41+cdcfoQ5GThwW
A8FhzTjVN2AznMXhajngs2VdYCWpuh6cU0/+ejsh5Ohn7cECQQDD7tK9zpwKYnSy
E402al7FzpwWBl98P0flItAnJEYrKOqa2H/r96BWRZya6WaKtRL6t7B1UaNGxBjZ
Rzq5LtodAkEAwsQjw1RAkG4w48ffHRXT4tzjapRCJxhoMWQs1zcyr3Ma0Key78C6
ENcccJEkwF8aJss5nQVZNGq4izhNHHnJzwJAfDF0iXVd+UMhHwM/nj9cZVuqGlfd
zH68DqS7diQLCi58TrxukV671hN3ycWqBr/yENPAWQzvRtrjuU3qDhmBjQJBAKuv
Df9ew1MNbxc61pfi59Yw9F68tduUjjQLo+NKiulRw69uRDNHZjz2AeHQb98LdhgA
SJb7YfjsoiRGyuJxEM0CQQCE3KBmbl42dmdGH0nvoo1lBYZajyAnuE7QYUbehnRG
6viM5dX/SAHmFDErR5+7X/JoWXPirzobPQ4APllgTpca
-----END RSA PRIVATE KEY-----`;

export const userAuth = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "unauthorized access" });

  try {
    let user;

    try {
      user = jwt.verify(token, secretKey, { algorithms: "HS256" });
    } catch (e) {
      console.log("error verifying anonymous user token ", e.message);
      try {
        user = jwt.verify(token, process.env.SECRET_KEY);
      } catch (e) {
        user = null;
        console.log(
          "error verifying logged in user token",
          { token, secret: process.env.SECRET_KEY },
          e.message
        );
      }
    }

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
      req.user = user;
    }

    next();
  } catch (e) {
    console.log({ e });
    res.status(401).send({ message: "unauthorized access" });
  }
};
