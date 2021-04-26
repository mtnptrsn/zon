import { IController } from "../types/controller";
import { RoomModel } from "../models/RoomModel";
import { getDistance } from "geolib";
import { getRandomPlayerColor } from "../utils/color";
import { add } from "date-fns";
import { generateMap } from "../utils/map";

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
    socket.emit(`room:${room._id}:onUpdate`, room);
    callback?.(room);
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
    const map = (Boolean(data.map.length)
      ? data.map
      : generateMap(data.hostLocation, data.radius)
    ).map((coordinate) => {
      return {
        location: {
          type: "Point",
          coordinates: coordinate,
        },
      };
    });
    room.map.points = map;
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
      ) < 30;
    if (playerIsWithinHome !== player.isWithinHome) {
      room.players[playerIndex].isWithinHome = playerIsWithinHome;
      didUpdate = true;
    }
    room.map.points.forEach((point: any, index: number) => {
      const [longitude, latitude] = point.location.coordinates;
      const collectedBy = point.collectedBy;
      const distance = getDistance(
        { lng: longitude, lat: latitude },
        { lng: data.coordinate[0], lat: data.coordinate[1] }
      );
      const hitbox = 10;
      const pointCollected = distance < hitbox && !Boolean(collectedBy);
      if (!pointCollected) return;
      didUpdate = true;
      event = {
        message: `{player} just collected a point!`,
        player,
      };
      room.map.points[index].collectedBy = player;
    });
    await room.save();
    if (event) io.emit(`room:${room._id}:onEvent`, event);
    if (didUpdate) io.emit(`room:${room._id}:onUpdate`, room);
    callback(room);
  };
}
