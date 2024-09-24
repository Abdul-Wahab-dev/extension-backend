const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    email: {
      type: String,
    },
    subject: {
      type: String,
    },
    detail: {
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

exports.Contact = mongoose.model("contact", contactSchema);
