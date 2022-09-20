const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { filterObj } = require("../utils/helpers");
const Place = require("../models/placeModel");

/*****
 * CONTROLLER TO GET ALL PLACES
 * ******/
exports.getAllPlaces = catchAsync(async (req, res, next) => {
  const places = await Place.find({}, null, {
    sort: { createdAt: -1 },
  }).populate({
    path: "category",
    select: "name image",
  });

  res.status(200).json({
    status: "success",
    results: places.length,
    message: "places fetched successfully",
    data: {
      places,
    },
  });
});

/*****
 * CONTROLLER TO GET ONE PLACE
 * ******/
exports.getOnePlace = catchAsync(async (req, res, next) => {
  const place = await Place.findById(req.params.id).populate("category");

  if (!place) {
    return next(new AppError("No place found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Place fetched successfully",
    data: {
      place,
    },
  });
});

/*****
 * CONTROLLER FOR ADDING NEW PLACE
 * ******/
exports.createPlace = catchAsync(async (req, res, next) => {
  const placeExist = await Place.findOne({
    name: req.body.name.trim().toLowerCase(),
  });

  if (placeExist) {
    return next(new AppError("Place with this name already exist", 422));
  }

  const newPlace = await Place.create({
    name: req.body.name,
    category: req.body.category,
  });

  await newPlace.save();

  res.status(201).json({
    status: "success",
    message: "Place created successfully",
    data: {
      place: newPlace,
    },
  });
});

/*****
 * CONTROLLER FOR EDITING PLACE DETAILS
 * ******/
exports.editPlaceDetails = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "name",
    "address",
    "phone",
    "email",
    "category"
  );

  const updatedPlace = await Place.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPlace) {
    return next(new AppError("No place found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Place edited successfully",
    data: {
      poll: updatedPlace,
    },
  });
});

/*****
 * CONTROLLER FOR DELETING PLACE
 * ******/
