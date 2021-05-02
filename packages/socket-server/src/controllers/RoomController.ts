import { IController } from "../types/controller";
import { RoomModel } from "../models/RoomModel";
import { getDistance } from "geolib";
import { getRandomPlayerColor } from "../utils/color";
import { add, isValid } from "date-fns";
import { generateMap } from "../utils/map";
import { PlayerPositionModel } from "../models/PlayerPositionModel";
import { Document, isValidObjectId } from "mongoose";
import { getStreetCoordinates } from "../utils/osm";
import { gameConfig } from "../config/game";

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
    // map: [number, number][];
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

function shuffle(array: any[]) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

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
}

const checkPointCollected = (
  point: any,
  player: any,
  playerCoordinate: [number, number],
  hitbox: number
) => {
  const [longitude, latitude] = point.location.coordinates;
  const distance = getDistance(
    { lng: longitude, lat: latitude },
    { lng: playerCoordinate[0], lat: playerCoordinate[1] }
  );
  const isWithinHitbox = distance < hitbox;

  if (!isWithinHitbox) return false;
  if (!player.hasTakenFirstPoint && point.belongsTo?.id !== player._id)
    return false;
  if (Boolean(point.belongsTo) && point.belongsTo?.id !== player._id)
    return false;
  if (Boolean(point.collectedBy)) return false;

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
    if (!isValidObjectId(data.roomId)) return callback?.(null);

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

    room.status = "COUNTDOWN";

    const streetCoordinates = await getStreetCoordinates(
      data.hostLocation,
      // [-73.99392595404598, 40.72458054965671],
      // [18.064170017918602, 59.334781722737716],
      data.radius
    );

    const points = generateMap(shuffle(streetCoordinates!), data.radius);

    const longestDistancePoint = points.reduce(
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

    const map = points.map((coordinate) => {
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
        belongsTo: null,
      };
    });

    const pointsInDistanceOrder = points.sort((a, b) => {
      const bDistance = getDistance(
        { lng: b[0], lat: b[1] },
        { lng: data.hostLocation[0], lat: data.hostLocation[1] }
      );
      const aDistance = getDistance(
        { lng: a[0], lat: a[1] },
        { lng: data.hostLocation[0], lat: data.hostLocation[1] }
      );
      return aDistance - bDistance;
    });

    shuffle(room.players).forEach((player: any, index: number) => {
      const mapIndex = map.findIndex(
        (point) =>
          pointsInDistanceOrder[index].join("") ===
          point.location.coordinates.join("")
      );
      map[mapIndex].belongsTo = player;
    });
    room.map.points = map;
    room.map.start = {
      location: {
        type: "Point",
        coordinates: data.hostLocation,
      },
    };
    room.startedAt = add(new Date(), {
      seconds: gameConfig.durations.start,
    });
    room.finishedAt = add(new Date(), {
      seconds: data.duration / 1000 + gameConfig.durations.start,
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
    io.emit(`room:${room._id}:onEvent`, {
      message: `The host ended the game`,
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
    PlayerPositionModel.create({
      roomId: data.roomId,
      playerId: data.playerId,
      location: {
        type: "Point",
        coordinates: data.coordinate,
      },
    });

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

    const previousScore = room.map.points.reduce((acc: number, point: any) => {
      if (point.collectedBy?._id === player._id) return acc + point.weight;
      return acc;
    }, 0);

    const playerIsWithinHome =
      getDistance(
        { lng: data.coordinate[0], lat: data.coordinate[1] },
        {
          lng: room.map.start.location.coordinates[0],
          lat: room.map.start.location.coordinates[1],
        }
      ) < gameConfig.hitbox.home;

    if (playerIsWithinHome !== player.isWithinHome) {
      room.players[playerIndex].isWithinHome = playerIsWithinHome;
      if (playerIsWithinHome)
        event = {
          message: `{player} just arrived back home`,
          type: "info-player",
          player,
          icon: "home",
        };
      didUpdate = true;
    }

    room.map.points.forEach((point: any, index: number) => {
      const pointCollected = checkPointCollected(
        point,
        player,
        data.coordinate,
        gameConfig.hitbox.point
      );
      if (!pointCollected) return;
      if (!player.hasTakenFirstPoint)
        room.players[playerIndex].hasTakenFirstPoint = true;
      didUpdate = true;
      event = {
        player,
        type: "score",
        previousScore,
      };
      room.map.points[index].collectedBy = player;
      room.map.points[index].collectedAt = new Date();
    });
    await room.save();
    if (event) io.emit(`room:${room._id}:onEvent`, event);
    if (didUpdate) io.emit(`room:${room._id}:onUpdate`, room);
    callback?.(room);
  };
}
