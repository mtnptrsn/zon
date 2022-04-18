import { IController } from "../types/controller";
import { RoomModel } from "../models/RoomModel";
import { getDistance } from "geolib";
import { getRandomPlayerColor } from "../utils/color";
import { add, differenceInMilliseconds, isValid } from "date-fns";
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
  const [longitude, latitude] = point.location.coordinates;
  const distance = getDistance(
    { lng: longitude, lat: latitude },
    { lng: playerCoordinate[0], lat: playerCoordinate[1] }
  );
  const isWithinHitbox = distance < hitbox;
  const timeSinceCollected = differenceInMilliseconds(
    new Date(),
    new Date(point.collectedAt)
  );

  if (!isWithinHitbox) return false;
  if (point.collectedBy?._id === player._id) return false;

  if (!player.hasTakenFirstPoint && point.belongsTo?.id !== player._id)
    return false;
  if (
    point.belongsTo?.id !== player._id &&
    Boolean(point.belongsTo) &&
    !Boolean(point.collectedBy)
  )
    return false;
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
    if (data.hardmode) room.flags = [...room.flags, "HARDMODE"];

    // console.time("RoomController:start:getStreetCoordinates");
    const streetCoordinates = await getStreetCoordinates(
      data.hostLocation,
      data.radius
    );
    // console.timeEnd("RoomController:start:getStreetCoordinates");

    const points = generateMap(shuffle(streetCoordinates!), data.radius, [
      data.hostLocation,
    ]);

    const map = points.map((coordinate) => {
      const distance = getDistance(
        { longitude: data.hostLocation[0], latitude: data.hostLocation[1] },
        { longitude: coordinate[0], latitude: coordinate[1] }
      );

      // TODO: Refactor
      // TODO: Improve this
      const max = 3;
      const dp = distance / data.radius;
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

    room.players.forEach((player: any) => {
      if (player.isWithinHome) {
        const points = room.map.points.filter((point: any) => {
          return point.collectedBy?._id === player._id;
        });
        const scoreToAdd = points.reduce(
          (acc: number, point: any) => acc + point.weight,
          0
        );
        player.score += scoreToAdd;
      }
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
    let events: any[] = [];
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
      ) < gameConfig.hitbox.home;
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
      didUpdate = true;
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
      if (!player.hasTakenFirstPoint)
        room.players[playerIndex].hasTakenFirstPoint = true;
      didUpdate = true;
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

          let message = `${current} captured a zone worth ${point.weight} ${
            point.weight > 1 ? "points" : "point"
          }.`;
          if (previousOwner)
            message = `${current} stole a zone from ${previous} worth ${
              point.weight
            } ${point.weight > 1 ? "points" : "point"}.`;

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
    if (didUpdate) io.emit(`room:${room._id}:onUpdate`, room);
    callback?.(room);
  };
}
