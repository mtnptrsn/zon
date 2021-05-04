import { Server } from "socket.io";
import { RoomModel } from "./models/RoomModel";
import { add, differenceInMilliseconds } from "date-fns";
import { PlayerPositionModel } from "./models/PlayerPositionModel";

const onFinish = async (io: Server, room: any) => {
  if (process.env.LOGS) console.time("ticker:onFinish");
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

const onDistributeScore = async (io: Server, room: any) => {
  if (process.env.LOGS) console.time("ticker:onDistributeScore");
  room.scoreDistributedAt = new Date();
  room.map.points.forEach((point: any) => {
    const player = room.players.find((player: any) => {
      return player._id === point.collectedBy?._id;
    });
    if (player) player.score += point.weight;
  });
  await room.save();
  io.emit(`room:${room._id}:onUpdate`, room);
  // io.emit(`room:${room._id}:onEvent`, {
  //   message: "Points are being distributed...",
  //   type: "info",
  // });
  if (process.env.LOGS) console.timeEnd("ticker:onDistributeScore");
};

export const ticker = async (io: Server) => {
  const rooms = await RoomModel.find({
    status: { $in: ["PLAYING", "COUNTDOWN"] },
  });

  rooms.forEach(async (room) => {
    const timeUntil = {
      start: differenceInMilliseconds(room.startedAt, new Date()),
      finish: differenceInMilliseconds(room.finishedAt, new Date()),
      distributeScore: differenceInMilliseconds(
        add(room.scoreDistributedAt, { minutes: 1 }),
        new Date()
      ),
    };

    if (timeUntil.start <= 0 && room.status === "COUNTDOWN")
      return onStart(io, room);
    if (timeUntil.finish <= 0) return onFinish(io, room);
    if (
      timeUntil.distributeScore <= 0 &&
      room.status === "PLAYING" &&
      room.flags.includes("DOMINATION")
    )
      return onDistributeScore(io, room);
  });
};
