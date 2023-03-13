import { Rooms } from "../../database/rooms.js";
import { RoomManager } from "../../utils/MeetingConstants.js";

export const muteAll = async (req, res) => {
  const roomId = req.params.id;

  const room = await Rooms.findOne({ meetingId: roomId });

  if (!room || room.deleted)
    return res.status(404).send({ message: "Room not found" });

  if (!room.moderator.equals(req.user._id)) {
    return res.status(400).send({ message: "Unauthorized access" });
  }

  try {
    const allParticipants = await RoomManager.listParticipants(roomId);

    allParticipants.forEach((item) => {
      if (item.identity === req.user.username) return;

      item.tracks.forEach((track) => {
        if (!track.mimeType.includes("audio") || track.muted) return;

        RoomManager.mutePublishedTrack(roomId, item.identity, track.sid, true);
      });
    });

    return res.status(200).send({ message: "Muted All" });
  } catch (e) {
    const response = e.response;

    if (response?.status === 404) {
      return res
        .status(400)
        .send({ message: "Please join room before trying to mute all" });
    }

    return res.status(400).send({ message: e.message });
  }
};
