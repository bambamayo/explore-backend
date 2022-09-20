const AppError = require("../utils/appError");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const Comment = require("../models/commentModel");
const Review = require("../models/reviewModel");

/*****
 * CONTROLLER TO CREATE NEW COMMENT
 * ******/
exports.createComment = catchAsync(async (req, res, next) => {
  const createdComment = new Comment({
    text: req.body.text,
    review: req.body.review,
  });

  const review = await Review.findById(req.body.review);

  if (!review) {
    return next(
      new HttpError("Creating comment failed, please try again", 500)
    );
  }

  const sess = await mongoose.startSession();
  sess.startTransaction();
  await createdComment.save({ session: sess });
  review.comments.push(createdComment);
  await review.save({ session: sess });

  await sess.commitTransaction();

  res.status(201).json({
    status: "success",
    message: "Comment created successfully",
    data: {
      comment: createdComment,
    },
  });
});

/*****
 * CONTROLLER TO DELETE COMMENT
 * ******/
exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id).populate("review");

  if (!comment) {
    return next(new HttpError("No comment found with that ID", 404));
  }

  const sess = await mongoose.startSession();
  sess.startTransaction();
  await comment.remove({ session: sess });
  comment.review.comments.pull(comment);
  await comment.review.save({ session: sess });
  await sess.commitTransaction();

  res.status(204).json({
    status: "success",
    message: "Comment deleted successfully",
    data: null,
  });
});
