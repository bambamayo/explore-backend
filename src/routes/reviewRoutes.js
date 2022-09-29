const express = require("express");
const reviewController = require("../controllers/reviewsController");
const { multerUploadsMultiple } = require("../utils/multer");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", reviewController.getAllReviews);
router.post("/", authController.protect, reviewController.createReview);

router.get("/:id", reviewController.getOneReview);
router.get("/places-review/:id", reviewController.getReviewsForAPlace);
router.patch(
  "/edit-likes/:id",
  authController.protect,
  reviewController.increaseOrReduceReviewsLikes
);
router.patch(
  "/:id",
  authController.protect,
  reviewController.editReviewDetails
);
router.patch(
  "/:id/add-images",
  authController.protect,
  multerUploadsMultiple,
  reviewController.addReviewImages
);
router.patch(
  "/:id/remove-images",
  authController.protect,
  reviewController.removeReviewImages
);
router.delete("/:id", authController.protect, reviewController.deleteReview);

module.exports = router;
