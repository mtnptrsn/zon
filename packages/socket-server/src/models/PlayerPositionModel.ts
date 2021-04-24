import { model, Schema, Model } from "mongoose";

const PlayerPositionSchema: Schema = new Schema(
  {
    playerId: { type: String, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const PlayerPositionModel: Model<any> = model(
  "PlayerPosition",
  PlayerPositionSchema
);
