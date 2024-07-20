const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    amount: {
      type: Number,
      required: [true, "amount is required"],
    },
    externalId: {
      type: String,
    },
    plan: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      required: [true, "User is required"],
    },
    success: {
      type: Boolean,
      default: false,
    },
    refund: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
    },
    billingReason: {
      type: String,
    },
    checkoutSessionId: {
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

exports.Payment = mongoose.model("payment", paymentSchema);
