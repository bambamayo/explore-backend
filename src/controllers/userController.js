const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { filterObj } = require("../utils/helpers");

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates", 400));
  }

  const filteredBody = filterObj(req.body, "fullname", "username");

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User details edited successfully",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  console.log("deleted");
});
