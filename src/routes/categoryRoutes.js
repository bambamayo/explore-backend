const express = require("express");
const categoryController = require("../controllers/categoryController");
const authController = require("../controllers/authController");
const { multerUploads } = require("../utils/multer");

const router = express.Router();

router
  .route("/")
  .get(categoryController.getAllCategories)
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    multerUploads,
    categoryController.createCategory
  );

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    categoryController.editCategoryDetails
  );

router
  .route("/:id/edit-image")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    multerUploads,
    categoryController.editCategoryImage
  );

module.exports = router;
