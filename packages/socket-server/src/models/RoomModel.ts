import { model, Schema, Model } from "mongoose";
import shortId from "shortid";

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
  score: {
    type: Number,
    default: 0,
  },
  location: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      default: () => [0, 0],
    },
  },
  startLocation: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      default: () => [0, 0],
    },
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
});

const RoomSchema: Schema = new Schema(
  {
    shortId: {
      type: String,
      default: shortId.generate,
    },
    players: [PlayerSchema],
    status: {
      type: String,
      enum: ["ARRANGING", "COUNTDOWN", "PLAYING", "FINISHED", "CANCELLED"],
    },
    map: {
      points: [PointSchema],
      homes: [PointSchema],
      radius: {
        type: Number,
        default: 0,
      },
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
  },
  { timestamps: true }
);

export const RoomModel: Model<any> = model("Room", RoomSchema);
