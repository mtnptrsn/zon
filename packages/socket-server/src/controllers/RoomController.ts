import { IController } from "../types/controller";
import { RoomModel } from "../models/RoomModel";
import { getDistance } from "geolib";
import { getRandomPlayerColor } from "../utils/color";
import { add } from "date-fns";
import { generateMap } from "../utils/map";
import { gameSettings } from "../config/game";

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
    hostLocation: [number, number];
    duration: number;
    radius: number;
    map: [number, number][];
  }

  export interface IEnd {
    roomId: string;
  }

  export interface IPositionUpdate {
    roomId: string;
    playerId: string;
    coordinate: [number, number];
  }
}

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
    const room = await RoomModel.findById(data.roomId);
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
    _,
    socket,
    io
  ) => {
    const room = await RoomModel.findById(data.roomId);
    const host = room.players.find((player: any) => player.isHost);
    const hostIsLeaving = host._id === data.userId;
    if (hostIsLeaving && room.status === "ARRANGING") room.status = "FINISHED";
    await room.save();
    io.emit(`room:${room._id}:onUpdate`, room);
  };

  static get: IController<RoomController.IGet> = async (data, callback) => {
    const room = await RoomModel.findById(data.roomId);
    callback?.(room);
  };

  static start: IController<RoomController.IStart> = async (
    data,
    callback,
    socket,
    io
  ) => {
    const room = await RoomModel.findById(data.roomId);
    room.status = "COUNTDOWN";
    room.finishedAt = add(new Date(), {
      seconds: data.duration / 1000 + gameSettings.durations.countdown,
    });
    room.startedAt = add(new Date(), {
      seconds: gameSettings.durations.countdown,
    });
    const map = Boolean(data.map.length)
      ? data.map
      : generateMap(data.hostLocation, data.radius);

    const longestDistancePoint = map.reduce(
      (acc: number, coordinate: [number, number]) => {
        const distance = getDistance(
          { longitude: coordinate[0], latitude: coordinate[1] },
          { longitude: data.hostLocation[0], latitude: data.hostLocation[1] }
        );
        if (distance > acc) return distance;
        return acc;
      },
      0
    );

    const dbMap = map.map((coordinate) => {
      const distance = getDistance(
        { longitude: data.hostLocation[0], latitude: data.hostLocation[1] },
        { longitude: coordinate[0], latitude: coordinate[1] }
      );

      // TODO: Refactor
      // TODO: Improve this
      const max = 3;
      const dp = distance / longestDistancePoint;
      const randAdd = Math.pow(Math.random(), 2) * dp * max;
      const weight = Math.max(1, Math.floor(dp * max + randAdd));

      return {
        location: {
          type: "Point",
          coordinates: coordinate,
        },
        weight,
      };
    });
    room.map.points = dbMap;
    room.map.start = {
      location: {
        type: "Point",
        coordinates: data.hostLocation,
      },
    };
    await room.save();
    io.emit(`room:${room._id}:onUpdate`, room);
    callback?.(room);
  };

  static end: IController<RoomController.IEnd> = async (
    data,
    callback,
    socket,
    io
  ) => {
    const room = await RoomModel.findById(data.roomId);
    room.finishedAt = add(new Date(), {
      seconds: gameSettings.durations.promptEndGame,
    });
    await room.save();
    io.emit(`room:${room._id}:onUpdate`, room);
    io.emit(`room:${room._id}:onEvent`, {
      message: `The host just ended the game. The game will end in ${gameSettings.durations.promptEndGame} seconds.`,
      type: "info",
    });
    callback?.(room);
  };

  static positionUpdate: IController<RoomController.IPositionUpdate> = async (
    data,
    callback,
    socket,
    io
  ) => {
    let didUpdate = false;
    // TODO: Add support for multiple events
    let event = null;
    // How will this work when there are multiple clients calling this simultaneously?
    // TODO: Figure this out.
    const room = await RoomModel.findById(data.roomId);
    const playerIndex = room.players.findIndex(
      (player: any) => player._id === data.playerId
    );
    const player = room.players[playerIndex];
    const playerIsWithinHome =
      getDistance(
        { lng: data.coordinate[0], lat: data.coordinate[1] },
        {
          lng: room.map.start.location.coordinates[0],
          lat: room.map.start.location.coordinates[1],
        }
      ) < gameSettings.home.hitbox;
    if (playerIsWithinHome !== player.isWithinHome) {
      room.players[playerIndex].isWithinHome = playerIsWithinHome;
      if (playerIsWithinHome)
        event = {
          message: "{player} just arrived back home.",
          player,
        };
      didUpdate = true;
    }
    room.map.points.forEach((point: any, index: number) => {
      const [longitude, latitude] = point.location.coordinates;
      const collectedBy = point.collectedBy;
      const distance = getDistance(
        { lng: longitude, lat: latitude },
        { lng: data.coordinate[0], lat: data.coordinate[1] }
      );
      const pointCollected =
        distance < gameSettings.point.hitbox && !Boolean(collectedBy);
      if (!pointCollected) return;
      didUpdate = true;
      event = {
        message: `{player} just collected a point!`,
        player,
        type: "score",
      };
      room.map.points[index].collectedBy = player;
    });
    await room.save();
    if (event) io.emit(`room:${room._id}:onEvent`, event);
    if (didUpdate) io.emit(`room:${room._id}:onUpdate`, room);
    callback(room);
  };
}
