import { Rooms } from "../database/Rooms/index.js";

export const getRoomsCountForMonthAndModerator = async (month, moderator) => {
  const firstDay = new Date(2023, month - 1, 1);
  const lastDay = new Date(2023, month, 0);

  const rooms = await Rooms.find({
    start: { $gte: firstDay.toISOString(), $lte: lastDay.toISOString() },
    moderator,
  }).exec();

  const counts = {};

  for (let i = 1; i <= lastDay.getDate(); i++) {
    counts[new Date(2023, month - 1, i).getDate()] = 0;
  }

  for (const room of rooms) {
    const start = new Date(room.start);
    const date = new Date(2023, month - 1, start.getDate()).getDate();
    counts[date]++;
  }

  return counts;
};
