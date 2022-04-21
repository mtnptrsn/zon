import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { RoomController } from "./controllers/RoomController";
//@ts-ignore
import packageJson from "../package.json";

export const routes = (
  io: Server<DefaultEventsMap, DefaultEventsMap>,
  socket: Socket
) => {
  socket.on("room:create", (data, cb) =>
    RoomController.create(data, cb, socket, io)
  );
  socket.on("room:get", (data, cb) => RoomController.get(data, cb, socket, io));
  socket.on("room:join", (data, cb) =>
    RoomController.join(data, cb, socket, io)
  );
  socket.on("room:leave", (data, cb) =>
    RoomController.leave(data, cb, socket, io)
  );
  socket.on("room:update:start", (data, cb) =>
    RoomController.start(data, cb, socket, io)
  );
  socket.on("room:update:end", (data, cb) =>
    RoomController.end(data, cb, socket, io)
  );
  socket.on("user:updatePosition", (data, cb) =>
    RoomController.positionUpdate(data, cb, socket, io)
  );
  socket.on("user:updatePosition:lobby", (data, cb) =>
    RoomController.positionUpdateLobby(data, cb, socket, io)
  );

  socket.on("rooms:get", (data, cb) =>
    RoomController.getMyRooms(data, cb, socket, io)
  );

  // TODO: Extract this to controller
  socket.on("version:get", (data, cb) => {
    cb(packageJson.version);
  });
};
