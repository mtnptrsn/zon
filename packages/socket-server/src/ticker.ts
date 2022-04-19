import { Server } from "socket.io";
import { RoomModel } from "./models/RoomModel";
import { add, differenceInMilliseconds, sub } from "date-fns";
import { PlayerPositionModel } from "./models/PlayerPositionModel";
import { getDistance } from "geolib";

const onFinish = async (io: Server, room: any) => {
  if (process.env.LOGS) console.time("ticker:onFinish");

  room.players.forEach((player: any, playerIndex: number) => {
    if (player.isWithinHome) {
      const points = room.map.points.filter((point: any) => {
        return point.collectedBy?._id === player._id;
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

  // io.emit(`room:${room._id}:onEvent`, {
  //   message: "The game is over",
  //   type: "info",
  // });

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
  room.flags = [...room.flags, "10_MINUTES_LEFT_ANNOUNCEMENT"];

  await room.save();

  io.emit(`room:${room._id}:onEvent`, {
    message: `It's only 10 minutes left. Make sure to be as close to your home as possible for maximum points.`,
    type: "info",
    sound: "alert",
    vibrate: "long",
  });
};

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
      !room.flags.includes("10_MINUTES_LEFT_ANNOUNCEMENT") &&
      room.status === "PLAYING"
    )
      return onTimeAnnouncenment(io, room);
  });
};
