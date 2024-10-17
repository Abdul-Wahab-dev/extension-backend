const mongoose = require("mongoose");
const { Schema } = mongoose;

const customCollectionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    sites: {
      type: [String],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "User is required"],
    },
    disabled: {
      type: Boolean,
      default: false,
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

customCollectionSchema.virtual("contents", {
  ref: "content",
  foreignField: "collections",
  localField: "_id",
});

customCollectionSchema.virtual("sharedBy", {
  foreignField: "_id",
  localField: "user",
  ref: "user",
  justOne: true,
});
exports.CustomCollection = mongoose.model(
  "customCollection",
  customCollectionSchema
);
