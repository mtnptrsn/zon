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
  hasTakenFirstPoint: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
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
      type: [Number],
      required: true,
    },
  },
  collectedBy: {
    type: PlayerSchema,
    defalt: null,
  },
  collectedAt: {
    type: Date,
    default: null,
  },
  weight: {
    type: Number,
    default: null,
  },
  belongsTo: {
    type: PlayerSchema,
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
    alerts: {
      type: [String],
      default: [],
    },
    flags: {
      type: [String],
      default: [],
    },
    finishedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    scoreDistributedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const RoomModel: Model<any> = model("Room", RoomSchema);
