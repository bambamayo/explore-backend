const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { filterObj, getPaginationParams } = require("../utils/helpers");
const Place = require("../models/placeModel");

/*****
 * CONTROLLER TO GET ALL PLACES
 * ******/
exports.getAllPlaces = catchAsync(async (req, res, next) => {
  let query = Place.find();

  let totalPlaces = await Place.countDocuments();

  const { skip, limit, page } = getPaginationParams({
    page: req.query.page,
  });

  let order;

  if (req.query.order) {
    order = req.query.order === "asc" ? 1 : -1;
  }

  if (req.query.category) {
    query = query.find({
      category: req.query.category,
    });
  }

  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    if (skip >= totalPlaces) {
      return next(
        new AppError("The page you are requesting does not exist", 404)
      );
    }
  }

  const places = await query
    .sort({ createdAt: order ?? -1 })
    .select("-updatedAt")
    .populate({
      path: "category",
      select: "name image",
    });

  const pagination = {
    totalPlaces,
    totalPages: Math.ceil(totalPlaces / limit),
    currentPage: page,
  };

  res.status(200).json({
    status: "success",
    message: "places fetched successfully",
    data: {
      pagination,
      places,
    },
  });
});

/*****
 * CONTROLLER TO GET ONE PLACE
 * ******/
exports.getOnePlace = catchAsync(async (req, res, next) => {
  const place = await Place.findById(req.params.id)
    .select("-updatedAt")
    .populate({
      path: "category",
      select: "name image",
    });

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

  newPlace.updatedAt = undefined;

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

  updatedPlace.updatedAt = undefined;

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
//TODO
