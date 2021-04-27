import { Server } from "socket.io";
import { RoomModel } from "./models/RoomModel";
import { differenceInMilliseconds } from "date-fns";

const onFinish = async (io: Server, room: any) => {
  room.status = "FINISHED";
  await room.save();
  return io.emit(`room:${room._id}:onUpdate`, room);
};

const onStart = async (io: Server, room: any) => {
  room.status = "PLAYING";
  await room.save();
  return io.emit(`room:${room._id}:onUpdate`, room);
};

export const ticker = async (io: Server) => {
  const rooms = await RoomModel.find({
    status: { $in: ["PLAYING", "COUNTDOWN"] },
  });

  rooms.forEach(async (room) => {
    const timeUntil = {
      start: differenceInMilliseconds(room.startedAt, new Date()),
      finish: differenceInMilliseconds(room.finishedAt, new Date()),
    };

    if (timeUntil.start <= 0 && room.status === "COUNTDOWN")
      return onStart(io, room);
    if (timeUntil.finish <= 0) return onFinish(io, room);
  });
};
