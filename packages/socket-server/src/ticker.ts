import { Server } from "socket.io";
import { RoomModel } from "./models/RoomModel";
import { add, differenceInMilliseconds } from "date-fns";
import { PlayerPositionModel } from "./models/PlayerPositionModel";

const onFinish = async (io: Server, room: any) => {
  if (process.env.LOGS) console.time("ticker:onFinish");

  room.players.forEach((player: any) => {
    if (player.isWithinHome) {
      const points = room.map.points.filter((point: any) => {
        return point.collectedBy?._id === player._id;
      });
      const scoreToAdd = points.reduce(
        (acc: number, point: any) => acc + point.weight,
        0
      );
      player.score += scoreToAdd;
    }
  });

  room.status = "FINISHED";
  const playerPositions = await PlayerPositionModel.find({
    roomId: room._id,
  });
  await room.save();

  io.emit(`room:${room._id}:onEvent`, {
    message: "The game is over",
    type: "info",
  });

  io.emit(`room:${room._id}:onUpdate`, {
    ...room.toObject(),
    playerPositions: playerPositions,
  });

  if (process.env.LOGS) console.timeEnd("ticker:onFinish");
};

const onStart = async (io: Server, room: any) => {
  if (process.env.LOGS) console.time("ticker:onStart");
  room.status = "PLAYING";
  await room.save();
  io.emit(`room:${room._id}:onUpdate`, room);
  if (process.env.LOGS) console.timeEnd("ticker:onStart");
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
