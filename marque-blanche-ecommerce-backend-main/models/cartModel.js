const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: "Client",
    required: true,
    unique: true, // One cart per client
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      variation: {
        type: mongoose.Schema.ObjectId,
        default: null, // If product is variable
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` on every save
cartSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
