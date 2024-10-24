const mongoose = require("mongoose");
const { Schema } = mongoose;

const NoteSchema = new Schema(
  {
    url: {
      type: String,
      required: [true, "url is required"],
    },
    title: {
      type: String,
      required: [true, "description is required"],
    },
    description: {
      type: String,
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
    hide: {
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

NoteSchema.virtual("sharedBy", {
  foreignField: "_id",
  localField: "user",
  ref: "user",
  justOne: true,
});

exports.Note = mongoose.model("note", NoteSchema);
