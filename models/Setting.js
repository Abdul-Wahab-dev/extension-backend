const mongoose = require("mongoose");
const { Schema } = mongoose;

const settingSchema = new Schema(
  {
    defaultComponent: {
      type: String,
      default: "ALL_CONTENT",
      enum: ["ALL_CONTENT", "SITE_SPECIFIC", "USER_COLLECTION"],
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

exports.Setting = mongoose.model("setting", settingSchema);
