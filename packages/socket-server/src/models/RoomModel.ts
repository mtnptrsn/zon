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
  score: {
    type: Number,
    default: 0,
  },
});

const PointSchema: Schema = new Schema(
  {
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
    capturedBy: PlayerSchema,
  },
  { timestamps: true, id: true }
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
    points: [PointSchema],
    flags: {
      type: Map,
      of: { type: Boolean },
      default: {},
      required: true,
    },
    startedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const RoomModel: Model<any> = model("Room", RoomSchema);
