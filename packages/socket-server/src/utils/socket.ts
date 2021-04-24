// export const emitEvent = (io: Server)
import { Server } from "socket.io";

export const emitEvent = (io: Server, roomId: string, event: any) => {
  io.to(`room:${roomId}:events`).emit("update:events", event);
};

export const emitRoomUpdate = (io: Server, room: any) => {
  io.to(`room:${room._id}`).emit("update:room", room);
};
