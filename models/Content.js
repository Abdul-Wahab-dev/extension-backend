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
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

exports.Content = mongoose.model("content", contentSchema);
