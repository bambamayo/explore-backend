const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    place: {
      type: mongoose.Types.ObjectId,
      required: [true, "Place is required"],
      ref: "Place",
    },
    category: {
      type: mongoose.Types.ObjectId,
      rrquired: [true, "Category is required"],
      ref: "Category",
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    author: {
      type: String,
      default: "",
    },
    likes: {
      type: Number,
      default: 0,
    },
    media: [{ type: String }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

reviewSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Review", reviewSchema);
