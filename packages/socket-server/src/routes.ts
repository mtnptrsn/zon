import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { RoomController } from "./controllers/RoomController";

export const routes = (
  io: Server<DefaultEventsMap, DefaultEventsMap>,
  socket: Socket
) => {
  socket.on("create:room", (data, cb) =>
    RoomController.createRoom(data, cb, socket, io)
  );
};
