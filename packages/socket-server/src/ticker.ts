import { add, differenceInMilliseconds } from "date-fns";
import { getDistance } from "geolib";
import { Server } from "socket.io";
import { PlayerPositionModel } from "./models/PlayerPositionModel";
import { RoomModel } from "./models/RoomModel";

const onFinish = async (io: Server, room: any) => {
  if (process.env.LOGS) console.time("ticker:onFinish");

  room.players.forEach((player: any, playerIndex: number) => {
    if (player.isWithinHome) {
      const points = room.map.points.filter((point: any) => {
        const lastCapture = point.captures?.[point.captures.length - 1];
        return lastCapture?.playerId === player._id;
      });

      const playerLocation = player.location.coordinates;
      const homes = room.map.homes.map(
        (home: any) => home.location.coordinates
      );

      const closestHome = homes.reduce(
        (acc: any, current: any) => {
          const previousDistance = acc[1];
          const currentDistance = getDistance(playerLocation, current);
          if (currentDistance < previousDistance)
            return [current, currentDistance];
          return acc;
        },
        [homes[0], getDistance(playerLocation, homes[0])]
      );

      const distanceFromHome = closestHome[1];
      const endPointMultiplier = Math.max(
        0,
        1 - distanceFromHome / room.map.radius
      );

      const scoreToAdd = Math.ceil(
        points.reduce((acc: number, point: any) => acc + point.weight, 0) *
          endPointMultiplier
      );
      room.players[playerIndex].score += scoreToAdd;

      io.emit(`player:${player._id}:onEvent`, {
        message: `The game is over! You earned ${scoreToAdd} extra points. Well played!`,
      });
    }
  });

  room.status = "FINISHED";
  const playerPositions = await PlayerPositionModel.find({
    roomId: room._id,
  });
  await room.save();

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

const onTimeAnnouncenment = async (io: Server, room: any) => {
  room.flags.set("10_MINUTES_LEFT_ANNOUNCEMENT", true);

  await room.save();

  io.emit(`room:${room._id}:onEvent`, {
    message: `It's only 10 minutes left. Make sure to be as close to your home as possible for maximum points.`,
    type: "info",
    sound: "alert",
    vibrate: "long",
  });
};

function onSimulateChallengeGame(io: Server, room: any) {
  const elapsedTime = differenceInMilliseconds(new Date(), room.startedAt);
  const challengeRoomDate = add(room.challengeRoom.startedAt, {
    seconds: elapsedTime / 1000,
  });
  room.challengeRoom.map.points.forEach((point: any) => {
    point.captures.forEach((capture: any) => {
      if (point.captures?.length === 0) return;
      const hasPassed = challengeRoomDate > new Date(capture.createdAt);
      const hasSimulated = room.flags.get(`SIMULATED_${capture._id}`);

      if (!hasPassed || hasSimulated) return;

      const player = room.challengeRoom.players.find(
        (player: any) => player._id === capture.playerId
      );

      const playerScore = room.challengeRoom.map.points.reduce(
        (acc: any, point: any) => {
          if (point.captures.length === 0) return acc;
          const captures = point.captures.filter(
            (capture: any) => new Date(capture.createdAt) < challengeRoomDate
          );

          const scoreFromAllCaptures = captures.reduce(
            (acc: number, capture: any) => {
              if (capture.playerId === player._id) return acc + point.weight;
              return acc;
            },
            0
          );

          return acc + scoreFromAllCaptures;
        },
        0
      );

      room.flags.set(`SIMULATED_${capture._id}`, true);

      io.emit(`room:${room._id}:onEvent`, {
        message: `Ghost ${player.name} captured a zone worth ${point.weight} ${
          point.weight === 1 ? "point" : "points"
        } and has a total of ${playerScore}.`,
        type: "capture",
        player: { ...player, score: playerScore },
        sound: "alert",
        vibrate: "short",
        zone: point,
      });
    });
  });

  return room.save();
}

export const ticker = async (io: Server) => {
  const rooms = await RoomModel.find({
    status: { $in: ["PLAYING", "COUNTDOWN"] },
  });

  rooms.forEach(async (room) => {
    const timeUntil = {
      start: differenceInMilliseconds(room.startedAt, new Date()),
      finish: differenceInMilliseconds(room.finishedAt, new Date()),
      timeLeftAnnouncement: differenceInMilliseconds(
        room.finishedAt,
        add(new Date(), { minutes: 10 })
      ),
    };

    if (timeUntil.start <= 0 && room.status === "COUNTDOWN")
      return onStart(io, room);
    if (timeUntil.finish <= 0) return onFinish(io, room);
    if (
      timeUntil.timeLeftAnnouncement <= 0 &&
      !room.flags.get("10_MINUTES_LEFT_ANNOUNCEMENT") &&
      room.status === "PLAYING"
    )
      return onTimeAnnouncenment(io, room);
    if (room.status === "PLAYING" && Boolean(room.challengeRoom))
      return onSimulateChallengeGame(io, room);
  });
};
