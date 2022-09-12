const mongoose = require("mongoose");

const placeModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Place name is required"],
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

placeModel.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Place", placeSchema);
