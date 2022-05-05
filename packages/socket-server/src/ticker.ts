import { add, differenceInMilliseconds } from "date-fns";
import { Server } from "socket.io";
import { getPenalty } from "./lib/score/getPenalty";
import { PlayerPositionModel } from "./models/PlayerPositionModel";
import { RoomModel } from "./models/RoomModel";

const onFinish = async (io: Server, room: any) => {
  if (process.env.LOGS) console.time("ticker:onFinish");

  room.players.forEach((player: any, playerIndex: number) => {
    const penalty = getPenalty(player, room);

    room.players[playerIndex].score -= penalty;

    const pointPoints = penalty > 1 ? "points" : "point";

    const message =
      penalty > 0
        ? `The game is over. Since you wasn't back in time, you have been penalized ${penalty} ${pointPoints}.`
        : `The game is over. Well played!`;

    io.emit(`player:${player._id}:${room._id}:onEvent`, {
      message,
    });
  });

  room.status = "FINISHED";
  const playerPositions = await PlayerPositionModel.find({
    roomId: room._id,
  });
  const ghostPlayerPosition = await PlayerPositionModel.find({
    roomId: room.challengeRoom?._id,
  });
  await room.save();

  io.emit(`room:${room._id}:onUpdate`, {
    ...room.toObject(),
    playerPositions: [
      ...playerPositions,
      ...(ghostPlayerPosition || []).map((pp: any) => ({
        ...pp.toObject(),
        isGhost: true,
      })),
    ],
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

const onFirstAssist = async (io: Server, room: any) => {
  room.flags.set("ASSIST_1", true);

  await room.save();

  io.emit(`room:${room._id}:onUpdate`, room);

  io.emit(`room:${room._id}:onEvent`, {
    message:
      "5 minutes have passed. You can now see the direction of the zone.",
    type: "info",
    sound: "info",
    vibrate: "short",
  });
};

export const ticker = async (io: Server) => {
  const rooms = await RoomModel.find({
    status: { $in: ["PLAYING", "COUNTDOWN"] },
  });

  rooms.forEach(async (room) => {
    const timeUntil = {
      start: differenceInMilliseconds(room.startedAt, new Date()),
      fistAssist: differenceInMilliseconds(
        add(room.startedAt, { minutes: 5 }),
        new Date()
      ),
    };

    if (timeUntil.start <= 0 && room.status === "COUNTDOWN")
      return onStart(io, room);

    if (
      timeUntil.fistAssist <= 0 &&
      room.status === "PLAYING" &&
      !room.flags.get("ASSIST_1")
    )
      return onFirstAssist(io, room);

    // if (timeUntil.finish <= 0) return onFinish(io, room);
    // if (
    //   timeUntil.timeLeftAnnouncement <= 0 &&
    //   !room.flags.get("10_MINUTES_LEFT_ANNOUNCEMENT") &&
    //   room.status === "PLAYING"
    // )
    //   return onTimeAnnouncenment(io, room);
    // if (room.status === "PLAYING" && Boolean(room.challengeRoom))
    //   return onSimulateChallengeGame(io, room);
  });
};
