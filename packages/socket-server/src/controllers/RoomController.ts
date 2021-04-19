import { IController } from "../types/controller";
import { ICreateRoom } from "shared/types/room";
import { RoomModel } from "../models/RoomModel";

export class RoomController {
  static createRoom: IController = async (data: ICreateRoom, callback) => {
    const room = new RoomModel(data);
    await room.save();
    callback(room);
  };
}
