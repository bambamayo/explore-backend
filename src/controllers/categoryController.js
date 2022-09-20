const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { filterObj } = require("../utils/helpers");
const Category = require("../models/categoryModel");

/*****
 * CONTROLLER TO GET ALL CATEGORIES
 * ******/
exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();

  res.status(200).json({
    status: "success",
    results: categories.length,
    message: "categories fetched successfully",
    data: {
      categories,
    },
  });
});

/*****
 * CONTROLLER FOR ADDING NEW CATEGORY
 * ******/
exports.createCategory = catchAsync(async (req, res, next) => {
  const categoryExist = await Category.findOne({
    name: req.body.name.trim().toLowerCase(),
  });

  if (categoryExist) {
    return next(new AppError("Category with this name already exist", 422));
  }

  const newCategory = await Category.create({
    name: req.body.name,
    image: req.body.image,
  });

  await newCategory.save();

  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: {
      category: newCategory,
    },
  });
});

/*****
 * CONTROLLER FOR EDITING CATEGORY
 * ******/
exports.editCategoryDetails = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "image");

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCategory) {
    return next(new AppError("No category found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Category edited successfully",
    data: {
      category: updatedCategory,
    },
  });
});
