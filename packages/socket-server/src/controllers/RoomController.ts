import { add, differenceInMilliseconds } from "date-fns";
import { getDistance } from "geolib";
import { Document, isValidObjectId } from "mongoose";
import shortId from "shortid";
import { gameConfig } from "../config/game";
import { PlayerPositionModel } from "../models/PlayerPositionModel";
import { RoomModel } from "../models/RoomModel";
import { IController } from "../types/controller";
import { getRandomPlayerColor } from "../utils/color";
import { getMap } from "./generateMap";

export namespace RoomController {
  export interface ICreate {
    player: {
      id: string;
      name: string;
    };
  }
  export interface IJoin {
    roomId: string;
    player: {
      id: string;
      name: string;
    };
  }

  export interface IGet {
    roomId: string;
  }
  export interface ILeave {
    userId: string;
    roomId: string;
  }
  export interface IStart {
    roomId: string;
    duration: number;
    radius: number;
    control: boolean;
    hardmode: boolean;
  }

  export interface IEnd {
    roomId: string;
  }

  export interface IPositionUpdate {
    roomId: string;
    playerId: string;
    coordinate: [number, number];
  }

  export interface IPositionLobbyUpdate {
    roomId: string;
    playerId: string;
    coordinate: [number, number];
  }
}

const shuffle = (array: any[]) => {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

const checkPointCollected = (
  point: any,
  player: any,
  playerCoordinate: [number, number],
  hitbox: number
) => {
  const distance = getDistance(point.location.coordinates, playerCoordinate);
  const isWithinHitbox = distance < hitbox;
  const timeSinceCollected = differenceInMilliseconds(
    new Date(),
    new Date(point.collectedAt)
  );

  if (!isWithinHitbox) return false;
  if (point.collectedBy?._id === player._id) return false;
  if (
    Boolean(point.collectedAt) &&
    timeSinceCollected < gameConfig.durations.zoneLockedAfterCapture
  )
    return false;

  return true;
};

export class RoomController {
  static create: IController<RoomController.ICreate> = async (
    data,
    callback
  ) => {
    const room = new RoomModel({
      status: "ARRANGING",
      players: [
        {
          _id: data.player.id,
          name: data.player.name,
          isHost: true,
          color: getRandomPlayerColor([]),
        },
      ],
    });
    await room.save();
    callback?.(room);
  };

  static join: IController<RoomController.IJoin> = async (
    data,
    callback,
    socket,
    io
  ) => {
    if (!shortId.isValid(data.roomId)) return callback?.(null);

    const room = await RoomModel.findOne({ shortId: data.roomId });

    const takenColors = room.players.map((player: any) => player.color);

    room.players = [
      ...room.players,
      {
        _id: data.player.id,
        name: data.player.name,
        isHost: false,
        color: getRandomPlayerColor(takenColors),
      },
    ];
    await room.save();
    io.emit(`room:${room._id}:onUpdate`, room);
    callback?.(room);
  };

  static leave: IController<RoomController.ILeave> = async (
    data,
    callback,
    socket,
    io
  ) => {
    if (!isValidObjectId(data.roomId)) return;
    const room = await RoomModel.findById(data.roomId);
    if (!room) return;
    if (room.status !== "ARRANGING") return;

    const host = room.players.find((player: any) => player.isHost);
    const hostIsLeaving = host._id === data.userId;
    if (hostIsLeaving) room.status = "CANCELLED";
    else
      room.players = room.players.filter(
        (player: any) => player._id !== data.userId
      );
    await room.save();
    io.emit(`room:${room._id}:onUpdate`, room);
  };

  static get: IController<RoomController.IGet> = async (data, callback) => {
    if (!isValidObjectId(data.roomId)) return callback?.(null);

    const room: Document<any> = await RoomModel.findById(data.roomId);
    if (!room) return callback?.(null);
    const playerPositions = await PlayerPositionModel.find({
      roomId: data.roomId,
    });
    callback?.({
      ...room.toObject(),
      playerPositions,
    });
  };

  static start: IController<RoomController.IStart> = async (
    data,
    callback,
    socket,
    io
  ) => {
    if (process.env.LOGS) console.time("RoomController:start");
    const room = await RoomModel.findById(data.roomId);

    // TODO: Add error handling here, if player location isn't set
    const playerLocations = room.players.map(
      (player: any) => player.startLocation.coordinates
    );

    // TODO: Add error handling
    // if (playerLocations[0] === 0) return callback?.(null);

    let homes: [number, number][] = [playerLocations[0]];

    playerLocations.slice(1).forEach((playerLocation: [number, number]) => {
      const closestHome = homes.reduce(
        (acc, current) => {
          const previousDistance = acc[1];
          const currentDistance = getDistance(playerLocation, current);
          if (currentDistance < previousDistance)
            return [current, currentDistance];
          return acc;
        },
        [homes[0], getDistance(playerLocation, homes[0])]
      );
      if (closestHome[1] > data.radius * 2) homes = [...homes, playerLocation];
    });

    room.status = "COUNTDOWN";
    if (data.hardmode) room.flags = [...room.flags, "HARDMODE"];
    const map = await getMap(homes, data.radius);
    room.map.points = map;
    room.map.radius = data.radius;
    room.map.homes = homes.map((home) => {
      return {
        location: {
          type: "Point",
          coordinates: home,
        },
      };
    });

    room.startedAt = add(new Date(), {
      seconds: gameConfig.durations.start / 1000,
    });
    room.finishedAt = add(new Date(), {
      seconds: (data.duration + gameConfig.durations.start) / 1000,
    });
    await room.save();
    io.emit(`room:${room._id}:onUpdate`, room);
    callback?.(room);
    if (process.env.LOGS) console.timeEnd("RoomController:start");
  };

  static end: IController<RoomController.IEnd> = async (
    data,
    callback,
    socket,
    io
  ) => {
    const room = await RoomModel.findById(data.roomId);

    room.players.forEach((player: any, playerIndex: number) => {
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

      const points = room.map.points.filter((point: any) => {
        return point.collectedBy?._id === player._id;
      });

      const scoreToAdd = Math.ceil(
        points.reduce((acc: number, point: any) => acc + point.weight, 0) *
          endPointMultiplier
      );

      room.players[playerIndex].score += scoreToAdd;

      io.emit(`player:${player._id}:onEvent`, {
        message: `The host ended the game. You earned ${scoreToAdd} extra points. Well played!`,
      });
    });

    room.finishedAt = new Date();
    room.status = "FINISHED";
    await room.save();
    const playerPositions = await PlayerPositionModel.find({
      roomId: room._id,
    });
    io.emit(`room:${room._id}:onUpdate`, {
      ...room.toObject(),
      playerPositions,
    });
    // io.emit(`room:${room._id}:onEvent`, {
    //   message: `The host ended the game`,
    //   type: "info",
    // });
    callback?.(room);
  };

  static positionUpdate: IController<RoomController.IPositionUpdate> = async (
    data,
    callback,
    socket,
    io
  ) => {
    // rework this?
    PlayerPositionModel.create({
      roomId: data.roomId,
      playerId: data.playerId,
      location: {
        type: "Point",
        coordinates: data.coordinate,
      },
    });

    let events: any[] = [];
    const room = await RoomModel.findById(data.roomId);
    const playerIndex = room.players.findIndex(
      (player: any) => player._id === data.playerId
    );
    const player = room.players[playerIndex];

    room.players[playerIndex].location = {
      type: "Point",
      coordinates: data.coordinate,
    };

    const playerIsWithinHome = room.map.homes.some((home: any) => {
      return (
        getDistance(data.coordinate, home.location.coordinates) <
        gameConfig.hitbox.home
      );
    });

    if (playerIsWithinHome !== player.isWithinHome) {
      room.players[playerIndex].isWithinHome = playerIsWithinHome;
      if (playerIsWithinHome) {
        events = [
          ...events,
          ...room.players.map((_player: any) => {
            const isCurrentPlayer = _player._id === player._id;

            return {
              to: _player._id,
              message: `${
                isCurrentPlayer ? "You" : player.name
              } arrived back home.`,
              type: "info",
              vibrate: isCurrentPlayer ? "long" : "short",
            };
          }),
        ];
      }
    }
    room.map.points.forEach((point: any, index: number) => {
      if (
        !checkPointCollected(
          point,
          player,
          data.coordinate,
          gameConfig.hitbox.point
        )
      )
        return;
      const previousOwner = point.collectedBy;
      point.collectedBy = player;
      point.collectedAt = new Date();
      room.players[playerIndex].score += point.weight;

      events = [
        ...events,
        ...room.players.map((_player: any) => {
          const isCurrentPlayer = _player._id === player._id;
          const isPreviousOwner = _player._id === previousOwner?._id;

          const previous = isPreviousOwner ? "you" : previousOwner?.name;
          const current = isCurrentPlayer ? "You" : player.name;

          const hasHave = isCurrentPlayer ? "have" : "has";

          let message = `${current} captured a zone worth ${point.weight} ${
            point.weight > 1 ? "points" : "point"
          } and now ${hasHave} a total of ${player.score}.`;

          if (previousOwner)
            message = `${current} stole a zone from ${previous} worth ${
              point.weight
            } ${
              point.weight > 1 ? "points" : "point"
            } and now ${hasHave} a total of ${player.score}.`;

          return {
            to: _player._id,
            message,
            type: "capture",
            player,
            sound: isCurrentPlayer ? "success" : "alert",
            vibrate: isCurrentPlayer ? "long" : "short",
            zone: point,
          };
        }),
      ];
    });
    await room.save();

    events.forEach((event: any) =>
      io.emit(`player:${event.to}:onEvent`, event)
    );
    io.emit(`room:${room._id}:onUpdate`, room);
    callback?.(room);
  };

  static positionUpdateLobby: IController<RoomController.IPositionLobbyUpdate> =
    async (data, callback, socket, io) => {
      const room = await RoomModel.findById(data.roomId);
      const playerIndex = room.players.findIndex(
        (player: any) => player._id === data.playerId
      );
      room.players[playerIndex].startLocation = {
        type: "Point",
        coordinates: data.coordinate,
      };
      await room.save();
      io.emit(`room:${room._id}:onUpdate`, room);
      callback?.(room);
    };
}
