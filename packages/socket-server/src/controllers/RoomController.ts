import { add, differenceInMilliseconds } from "date-fns";
import { getDistance } from "geolib";
import { isValidObjectId } from "mongoose";
import shortId from "shortid";
import { gameConfig } from "../config/game";
import { getPenalty } from "../lib/score/getPenalty";
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
    challengeRoomId?: any;
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

  export interface IGetMyRooms {
    playerId: string;
    status: string;
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
    controls: number;
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

const checkPointCollected = (
  point: any,
  player: any,
  playerCoordinate: [number, number],
  hitbox: number
) => {
  const lastCapture = point.captures?.[point.captures.length - 1];
  const distance = getDistance(point.location.coordinates, playerCoordinate);
  const isWithinHitbox = distance < hitbox;
  const timeSinceCollected = differenceInMilliseconds(
    new Date(),
    new Date(lastCapture?.createdAt)
  );

  if (!isWithinHitbox) return false;

  if (lastCapture?.playerId === player._id) return false;
  if (
    Boolean(lastCapture?.createdAt) &&
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
    let challengeRoom = null;

    if (data.challengeRoomId) {
      challengeRoom = await RoomModel.findOne({
        shortId: data.challengeRoomId,
      });
    }

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
      challengeRoom,
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

    const room = await RoomModel.findById(data.roomId);
    if (!room) return callback?.(null);
    const playerPositions = await PlayerPositionModel.find({
      roomId: room._id,
    });
    const ghostPlayerPosition = await PlayerPositionModel.find({
      roomId: room.challengeRoom?._id,
    });
    callback?.({
      ...room.toObject(),
      playerPositions: [
        ...playerPositions,
        ...(ghostPlayerPosition || []).map((pp: any) => ({
          ...pp.toObject(),
          isGhost: true,
        })),
      ],
    });
  };

  static getMyRooms: IController<RoomController.IGetMyRooms> = async (
    data,
    callback
  ) => {
    const rooms = await RoomModel.find({
      players: {
        $elemMatch: {
          _id: data.playerId,
        },
      },
      status: data.status,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    callback?.(rooms);
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

    // let homes: [number, number][] = [playerLocations[0]];
    const home = playerLocations[0];

    // playerLocations.slice(1).forEach((playerLocation: [number, number]) => {
    //   const closestHome = homes.reduce(
    //     (acc, current) => {
    //       const previousDistance = acc[1];
    //       const currentDistance = getDistance(playerLocation, current);
    //       if (currentDistance < previousDistance)
    //         return [current, currentDistance];
    //       return acc;
    //     },
    //     [homes[0], getDistance(playerLocation, homes[0])]
    //   );
    //   if (closestHome[1] > data.radius * 2) homes = [...homes, playerLocation];
    // });

    room.status = "COUNTDOWN";
    if (data.hardmode) room.flags.set("HARDMODE", true);

    const map = await getMap([home], data.radius, data.controls);
    room.map.points = map;
    room.map.radius = data.radius;

    room.map.homes = [
      {
        location: {
          type: "Point",
          coordinates: home,
        },
      },
    ];

    // room.map.homes = homes.map((home) => {
    //   return {
    //     location: {
    //       type: "Point",
    //       coordinates: home,
    //     },
    //   };
    // });

    room.startedAt = add(new Date(), {
      seconds: gameConfig.durations.start / 1000,
    });
    room.finishedAt = add(new Date(), {
      seconds: (data.duration + gameConfig.durations.start) / 1000,
    });
    room.duration = data.duration;
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
      const penalty = getPenalty(player, room);

      room.players[playerIndex].score -= penalty;

      const pointPoints = penalty > 1 ? "points" : "point";

      const message =
        penalty > 0
          ? `The host ended the game. Since you wasn't back in time, you have been penalized ${penalty} ${pointPoints}.`
          : `The host ended the game. Well played!`;

      io.emit(`player:${player._id}:${room._id}:onEvent`, {
        message,
      });
    });

    room.finishedAt = new Date();
    room.status = "FINISHED";
    await room.save();
    const playerPositions = await PlayerPositionModel.find({
      roomId: room._id,
    });

    const ghostPlayerPosition = await PlayerPositionModel.find({
      roomId: room.challengeRoom?._id,
    });
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

    if (room.status !== "PLAYING") return;

    const playerIndex = room.players.findIndex(
      (player: any) => player._id === data.playerId
    );
    const player = room.players[playerIndex];

    room.players[playerIndex].location = {
      type: "Point",
      coordinates: data.coordinate,
    };

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

      point.captures = [
        ...point.captures,
        {
          playerId: player._id,
        },
      ];

      room.players[playerIndex].score += 1;

      events = [
        ...events,
        ...room.players.map((_player: any) => {
          const isCurrentPlayer = _player._id === player._id;

          return {
            to: _player._id,
            message: "You captured a point!",
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
      io.emit(`player:${event.to}:${room._id}:onEvent`, event)
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
