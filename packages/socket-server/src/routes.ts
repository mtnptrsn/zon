import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { RoomController } from "./controllers/RoomController";

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
  socket.on("user:updatePosition", (data, cb) =>
    RoomController.positionUpdate(data, cb, socket, io)
  );
};
