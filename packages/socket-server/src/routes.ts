import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { RoomController } from "./controllers/RoomController";

export const routes = (
  io: Server<DefaultEventsMap, DefaultEventsMap>,
  socket: Socket
) => {
  socket.on("create:room", (data, cb) =>
    RoomController.create(data, cb, socket, io)
  );
  socket.on("get:room", (data, cb) => RoomController.get(data, cb, socket, io));
  socket.on("join:room", (data, cb) =>
    RoomController.join(data, cb, socket, io)
  );
  socket.on("leave:room", (data, cb) =>
    RoomController.leave(data, cb, socket, io)
  );
  socket.on("subscribe:room", (data, cb) =>
    RoomController.subscribe(data, cb, socket, io)
  );
  socket.on("unsubscribe:room", (data, cb) =>
    RoomController.unsubscribe(data, cb, socket, io)
  );
  socket.on("start:room", (data, cb) =>
    RoomController.start(data, cb, socket, io)
  );
  socket.on("update:position", (data, cb) =>
    RoomController.positionUpdate(data, cb, socket, io)
  );
  // TODO: Merge this with subscribe:room instead.
  // We don't need 2 rooms for this.
  socket.on("subscribe:events", (data, cb) =>
    RoomController.subscribeToEvents(data, cb, socket, io)
  );
  socket.on("unsubscribe:events", (data, cb) =>
    RoomController.unsubscribeFromEvents(data, cb, socket, io)
  );
};
