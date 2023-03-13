import { RoomServiceClient } from "livekit-server-sdk";

export const RoomManager = new RoomServiceClient(
  process.env.MEET_URL,
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);
