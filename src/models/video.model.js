import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import mongoosePaginate from "mongoose-paginate-v2";

const videoSchema = new Schema(
  {
    videofile: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    duration: {
      type: Number,
    },

    time: {
      type: String,
      required: true,
    },

    views: {
      type: Number,
      default: 0,
    },

    ispublished: {
      type: Boolean,
      default: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
videoSchema.plugin(mongoosePaginate);
export const Video = mongoose.model("Video", videoSchema);