const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { filterObj, getCloudinaryPublicUrl } = require("../utils/helpers");
const Category = require("../models/categoryModel");
const { uploader } = require("../utils/cloudinaryConfig");
const { dataUri } = require("../utils/multer");
const { CLOUDINARY_FOLDERS } = require("../utils/constants");

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

  if (!req.file) {
    return next(new AppError("Please add category image", 422));
  }

  const file = dataUri(req);

  let categoryImage;

  try {
    categoryImage = await uploader.upload(file, {
      folder:
        process.env.NODE_ENV === "development"
          ? `explorer_images_dev/${CLOUDINARY_FOLDERS.CATEGORY}`
          : `explorer_images/${CLOUDINARY_FOLDERS.CATEGORY}`,
    });
  } catch (error) {
    return next(new AppError("Error creating category, please try later", 500));
  }

  const newCategory = await Category.create({
    name: req.body.name,
    image: categoryImage.secure_url,
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
 * CONTROLLER FOR EDITING CATEGORY DETAILS
 * ******/
exports.editCategoryDetails = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, "name");

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

/*****
 * CONTROLLER FOR EDITING CATEGORY IMAGE
 * ******/
exports.editCategoryImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please add category image", 422));
  }

  const category = await Category.findById(req.params.id);

  if (category.image) {
    try {
      await uploader.destroy(
        getCloudinaryPublicUrl(category.image, CLOUDINARY_FOLDERS.CATEGORY)
      );

      await Category.findByIdAndUpdate(req.params.id, { image: "" });
    } catch (error) {
      return next(
        new HttpError("Could not update category details, try later", 500)
      );
    }
  }

  const file = dataUri(req);

  let categoryImage;

  try {
    categoryImage = await uploader.upload(file, {
      folder:
        process.env.NODE_ENV === "development"
          ? `explorer_images_dev/${CLOUDINARY_FOLDERS.CATEGORY}`
          : `explorer_images/${CLOUDINARY_FOLDERS.CATEGORY}`,
    });
  } catch (error) {
    return next(new AppError("Error updating category, please try later", 500));
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name ?? category.name,
      image: categoryImage.secure_url ?? category.image,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: "success",
    message: "Category changed successfully",
    data: {
      category: updatedCategory,
    },
  });
});
