import { Server } from "socket.io";
import { RoomModel } from "./models/RoomModel";
import { differenceInMilliseconds } from "date-fns";
import { PlayerPositionModel } from "./models/PlayerPositionModel";

const onFinish = async (io: Server, room: any) => {
  room.status = "FINISHED";
  const playerPositions = await PlayerPositionModel.find({
    roomId: room._id,
  });
  await room.save();

  io.emit(`room:${room._id}:onEvent`, {
    message: "The game is finished",
    type: "info",
  });

  return io.emit(`room:${room._id}:onUpdate`, {
    ...room.toObject(),
    playerPositions: playerPositions,
  });
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
