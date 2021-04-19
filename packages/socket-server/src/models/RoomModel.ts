import { model, Schema, Model, Document } from "mongoose";
import { IRoom } from "shared/types/room";

const RoomSchema: Schema = new Schema({
  name: { type: String, required: true },
});

export const RoomModel: Model<IRoom & Document> = model("Room", RoomSchema);
