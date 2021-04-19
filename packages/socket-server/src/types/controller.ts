import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export type IController<T = any> = (
  data: T,
  callback: (data: any) => void,
  socket: Socket,
  io: Server<DefaultEventsMap, DefaultEventsMap>
) => void;
