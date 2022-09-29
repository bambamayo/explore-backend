const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { filterObj, getCloudinaryPublicUrl } = require("../utils/helpers");
const Review = require("../models/reviewModel");
const Place = require("../models/placeModel");
const Comment = require("../models/commentModel");
const { dataUriMultiple } = require("../utils/multer");
const { uploader } = require("../utils/cloudinaryConfig");

/*****
 * CONTROLLER TO GET ALL REVIEWS
 * ******/
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let query = Review.find({});

  //add if/else for sorting
  //Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const numReviews = await Review.countDocuments();
    if (skip >= numReviews) {
      return next(
        new AppError("The page you are requesting does not exist", 404)
      );
    }
  }

  const reviews = await query
    .sort({ createdAt: -1 })
    .populate({
      path: "place",
      select: "name",
    })
    .populate({
      path: "comments",
      select: "text createdAt",
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
  const review = await Review.findById(req.params.id)
    .populate({
      path: "place",
      select: "name category reviewsCount address phone",
      populate: { path: "category", select: "name image" },
    })
    .populate({
      path: "comments",
      select: "text createdAt",
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
exports.getReviewsForAPlace = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ place: req.params.id }, null, {
    sort: { createdAt: -1 },
  }).populate({ path: "comments", select: "text createdAt" });

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
  const createdReview = new Review({
    place: req.body.place,
    title: req.body.title,
    description: req.body.description,
  });

  const sess = await mongoose.startSession();
  sess.startTransaction();
  await createdReview.save({ session: sess, validateBeforeSave: true });
  let place = await Place.findByIdAndUpdate(req.body.place, {
    $inc: { reviewsCount: 1 },
  });
  if (!place) return next(new AppError("No place found with this ID", 404));
  await sess.commitTransaction();

  res.status(201).json({
    status: "success",
    message: "Review created successfully",
    data: {
      review: createdReview,
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

/*****
 * CONTROLLER FOR ADDING MEDIA TO REVIEW
 * ******/
exports.addReviewImages = catchAsync(async (req, res, next) => {
  if (!req.files) {
    return next(new AppError("Please add images", 422));
  }

  let multipleUploads = new Promise(async (resolve, reject) => {
    let upload_len = req.files.length;
    let upload_res = new Array();

    for (let i = 0; i <= upload_len; i++) {
      if (upload_res.length === upload_len) {
        resolve(upload_res);
      } else {
        const sentImg = dataUriMultiple(req.files, i);

        await uploader.upload(
          sentImg,
          {
            folder: "explorer_images/",
          },
          (error, result) => {
            if (result) {
              upload_res.push(result.secure_url);
            } else if (error) {
              reject(error);
            }
          }
        );
      }
    }
  })
    .then((result) => result)
    .catch((error) =>
      next(new AppError("Could not upload images at this time", 422))
    );

  let upload = await multipleUploads;

  let updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        media: {
          $each: [...upload],
        },
      },
    },
    { new: true }
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

/*****
 * CONTROLLER FOR DELETING REVIEW IMAGES
 * ******/
exports.removeReviewImages = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  uploader.destroy(
    getCloudinaryPublicUrl(req.body.url),
    async function (error, result) {
      if (error) {
        return next(
          new HttpError("Could not delete image(s), please try again", 400)
        );
      }
    }
  );

  review.media.pull(req.body.url);
  await review.save();

  res.status(200).json({
    status: "success",
    message: "Review image deleted successfully",
    data: {
      review,
    },
  });
});

/*****
 * CONTROLLER FOR DELETING REVIEW
 * ******/
exports.deleteReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError("No review found with that ID", 404));
  }

  let imagesToDelete = review.media;

  const sess = await mongoose.startSession();
  sess.startTransaction();
  await review.remove({ session: sess });
  await Comment.deleteMany({ review: review.id });
  await sess.commitTransaction();

  for (let i = 0; i < imagesToDelete.length; i++) {
    uploader.destroy(imagesToDelete[i], function (error, result) {
      if (error) {
        console.log(error);
      }
    });
  }

  res.status(204).json({
    status: "success",
    message: "Review deleted successfully",
    data: null,
  });
});
