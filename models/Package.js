const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    plan: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "User is required"],
    },
    planId: {
      type: String,
    },
    contentLimit: {
      type: Number,
      required: [true, "Limit is required"],
    },
    collectionLimit: {
      type: Number,
      required: [true, "Collection limit is required"],
    },
    noteLimit: {
      type: Number,
      required: [true, "note limit is required"],
    },
    shareWith: {
      type: Number,
      required: [true, "share with min 1 is required"],
    },
    subEndDate: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

exports.Package = mongoose.model("package", paymentSchema);
