const { default: mongoose } = require("mongoose");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { uploader } = require("../utils/cloudinaryConfig");
const { filterObj, getCloudinaryPublicUrl } = require("../utils/helpers");
const { dataUri } = require("../utils/multer");

exports.getMe = catchAsync(async (req, res, next) => {
  const { fullname, email, username, avatar, role, createdAt, updatedAt, id } =
    req.user;

  let me = {
    fullname,
    email,
    username,
    avatar,
    role,
    createdAt,
    updatedAt,
    id,
  };

  res.status(200).json({
    status: "success",
    message: "User details fetched successfully",
    data: {
      user: me,
    },
  });
});

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
    message: "User details updated successfully",
    data: {
      user: updatedUser,
    },
  });
});

exports.updateProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please add image", 422));
  }

  const file = dataUri(req);

  if (req.user.avatar) {
    uploader.destroy(
      getCloudinaryPublicUrl(req.user.avatar),
      async function (error) {
        if (error) {
          return next(new HttpError("Could not update user image", 500));
        }

        await User.findByIdAndUpdate(
          req.user.id,
          { avatar: "" },
          { new: true, runValidators: true }
        );
      }
    );
  }

  return uploader
    .upload(file, {
      folder:
        process.env.NODE_ENV === "development"
          ? "explorer_images_dev/"
          : "explorer_images/",
    })
    .then(async (result) => {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: result.secure_url },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: "success",
        message: "User profile picture updated successfully",
        data: {
          user: updatedUser,
        },
      });
    })
    .catch((err) => {
      return next("Something went wrong", 500);
    });
});

exports.deleteProfilePicture = catchAsync(async (req, res, next) => {
  if (!req.user.avatar) {
    return next(new AppError("User does not have a profile picture", 400));
  }

  uploader.destroy(
    getCloudinaryPublicUrl(req.user.avatar),
    async function (error) {
      if (error) {
        return next(new HttpError("Could not update user image", 500));
      }

      let updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: "" },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        status: "success",
        message: "User profile picture updated successfully",
        data: {
          user: updatedUser,
        },
      });
    }
  );
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  //TODO
  console.log("deleted");
});
