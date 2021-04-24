import { IController } from "../types/controller";
import { RoomModel } from "../models/RoomModel";
import { getDistance } from "geolib";
import { getRandomPlayerColor } from "../utils/color";
import { add } from "date-fns";
import { generateMap } from "../utils/map";
import { PlayerPositionModel } from "../models/PlayerPositionModel";
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
  export interface ISubscribe {
    roomId: string;
  }

  export interface IGet {
    roomId: string;
  }
  export interface IUnSubscribe {
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
    socket
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
    socket.to(`room:${room._id}`).emit("update:room", room);
    callback?.(room);
  };

  static subscribe: IController<RoomController.ISubscribe> = async (
    data,
    _,
    socket
  ) => {
    socket.join(`room:${data.roomId}`);
  };

  static unsubscribe: IController<RoomController.IUnSubscribe> = async (
    data,
    _,
    socket
  ) => {
    socket.leave(`room:${data.roomId}`);
  };

  static leave: IController<RoomController.ILeave> = async (
    data,
    _,
    socket
  ) => {
    const room = await RoomModel.findById(data.roomId);
    const host = room.players.find((player: any) => player.isHost);
    const hostIsLeaving = host._id === data.userId;
    if (hostIsLeaving) room.status = "CANCELLED";
    await room.save();

    // TODO: Also disconnected everyone else
    socket.leave(`room:${data.roomId}`);
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
    room.finishedAt = add(new Date(), { seconds: data.duration / 1000 + 10 });
    room.startedAt = add(new Date(), { seconds: 10 });
    const randomMap = generateMap(data.hostLocation, data.radius, 10);
    room.map.points = randomMap.map((coordinate) => {
      return {
        location: {
          type: "Point",
          coordinates: coordinate,
        },
      };
    });
    room.map.start = {
      location: {
        type: "Point",
        coordinates: data.hostLocation,
      },
    };
    await room.save();
    io.to(`room:${room._id}`).emit("update:room", room);
    callback?.(room);
  };

  static positionUpdate: IController<RoomController.IPositionUpdate> = async (
    data,
    callback,
    socket,
    io
  ) => {
    // TODO: Add support for multiple events
    let event = null;
    // How will this work when there are multiple clients calling this simultaneously?
    // TODO: Figure this out.
    await PlayerPositionModel.create({
      playerId: data.playerId,
      roomId: data.roomId,
      location: {
        type: "Point",
        coordinates: data.coordinate,
      },
    });
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
      ) < 5;
    if (playerIsWithinHome !== player.isWithinHome)
      room.players[playerIndex].isWithinHome = playerIsWithinHome;
    room.map.points.forEach((point: any, index: number) => {
      const [longitude, latitude] = point.location.coordinates;
      const collectedBy = point.collectedBy;
      const pointCollected =
        getDistance(
          { lng: longitude, lat: latitude },
          { lng: data.coordinate[0], lat: data.coordinate[1] }
        ) < 10 && !Boolean(collectedBy);
      if (!pointCollected) return;
      event = {
        message: `{player} just collected a point!`,
        player,
      };
      room.map.points[index].collectedBy = player;
    });
    await room.save();
    io.to(`room:${room._id}`).emit("update:room", room);
    if (event) io.to(`room:${room._id}:events`).emit("update:events", event);
    callback(room);
  };

  static subscribeToEvents: IController<RoomController.IPositionUpdate> = async (
    data,
    _,
    socket
  ) => {
    socket.join(`room:${data.roomId}:events`);
  };

  static unsubscribeFromEvents: IController<RoomController.IPositionUpdate> = async (
    data,
    _,
    socket
  ) => {
    socket.leave(`room:${data.roomId}:events`);
  };
}
