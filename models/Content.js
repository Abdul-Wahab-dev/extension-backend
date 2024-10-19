const mongoose = require("mongoose");
const { Schema } = mongoose;

const contentSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "url is required"],
    },
    content: {
      type: String,
      required: [true, "description is required"],
    },
    hash: {
      type: String,
      required: [true, "hash is required"],
    },
    temp: {
      type: Boolean,
      default: false,
    },
    domain: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "User is required"],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    collections: {
      type: [mongoose.Schema.ObjectId],
      ref: "customCollection",
    },
    shareWith: {
      type: [String],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

contentSchema.virtual("sharedBy", {
  foreignField: "_id",
  localField: "user",
  ref: "user",
  justOne: true,
});

exports.Content = mongoose.model("content", contentSchema);
