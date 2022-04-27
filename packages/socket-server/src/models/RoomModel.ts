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
      default: [0, 0],
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

const CaptureSchema: Schema = new Schema(
  {
    playerId: {
      type: String,
      required: true,
    },
    flags: {
      type: Map,
      of: { type: Boolean },
      default: {},
      required: true,
    },
  },
  { timestamps: true, id: true }
);

const PointSchema: Schema = new Schema(
  {
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
    captures: [CaptureSchema],
    weight: {
      type: Number,
      default: null,
    },
  },
  { id: true }
);

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
    flags: {
      type: Map,
      of: { type: Boolean },
      default: {},
      required: true,
    },
    finishedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    challengeRoom: {
      type: this,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const RoomModel: Model<any> = model("Room", RoomSchema);
