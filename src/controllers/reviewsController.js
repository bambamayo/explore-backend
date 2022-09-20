const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { filterObj } = require("../utils/helpers");
const Review = require("../models/reviewModel");
const Place = require("../models/placeModel");

/*****
 * CONTROLLER TO GET ALL REVIEWS
 * ******/
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({}, null, {
    sort: { createdAt: -1 },
  }).populate({
    path: "place",
    select: "name",
  });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    message: "reviews fetched successfully",
    data: {
      reviews,
    },
  });
});

/*****
 * CONTROLLER TO GET ONE REVIEW
 * ******/
exports.getOneReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "place",
    populate: { path: "category" },
  });

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Review fetched successfully",
    data: {
      review,
    },
  });
});

/*****
 * CONTROLLER FOR GETTING REVIEWS OF A PLACE
 * ******/
exports.getReviewsForAllPlace = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ place: req.params.id }, null, {
    sort: { createdAt: -1 },
  });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    message: "reviews for place fetched successfully",
    data: {
      reviews,
    },
  });
});

/*****
 * CONTROLLER FOR ADDING NEW REVIEW
 * ******/
exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create({
    place: req.body.place,
    title: req.body.title,
    description: req.body.description,
  });

  await newReview.save();

  const place = await Place.findByIdAndUpdate(req.body.place, {
    $inc: { reviewsCount: 1 },
  });

  if (!place) console.log("Could not update place");

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: {
      review: newReview,
    },
  });
});

/*****
 * CONTROLLER FOR INCREASING OR REDUCING REVIEW LIKES
 * ******/
exports.increaseOrReduceReviewsLikes = catchAsync(async (req, res, next) => {
  let updatedReview;

  if (req.query.increase === "true") {
    updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { likes: 1 },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedReview) {
      return next(new AppError("No review found with that ID", 404));
    }
  } else if (req.query.increase === "false") {
    updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { likes: -1 },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedReview) {
      return next(new AppError("No review found with that ID", 404));
    }
  }

  res.status(200).json({
    status: "success",
    message: "Review edited successfully",
    data: {
      review: updatedReview,
    },
  });
});

/*****
 * CONTROLLER FOR EDITING REVIEW DETAILS
 * ******/
exports.editReviewDetails = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "title", "description");

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedReview) {
    return next(new AppError("No review found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Review edited successfully",
    data: {
      review: updatedReview,
    },
  });
});
