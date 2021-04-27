import { model, Schema, Model } from "mongoose";

const PlayerSchema: Schema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  isHost: {
    type: Boolean,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  isWithinHome: {
    type: Boolean,
    default: true,
  },
});

const PointSchema: Schema = new Schema({
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      // long, lat
      type: [Number],
      required: true,
    },
  },
  collectedBy: {
    type: PlayerSchema,
    defalt: null,
  },
  weight: {
    type: Number,
    default: null,
  },
});

const RoomSchema: Schema = new Schema(
  {
    players: [PlayerSchema],
    status: {
      type: String,
      enum: ["ARRANGING", "COUNTDOWN", "PLAYING", "FINISHED", "CANCELLED"],
    },
    map: {
      points: [PointSchema],
      start: PointSchema,
    },
    finishedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    alerts: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const RoomModel: Model<any> = model("Room", RoomSchema);
