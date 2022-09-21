const express = require("express");
const reviewController = require("../controllers/reviewsController");
const { multerUploadsMultiple } = require("../utils/multer");

const router = express.Router();

router.get("/", reviewController.getAllReviews);
router.post("/", reviewController.createReview);

router.get("/:id", reviewController.getOneReview);
router.get("/places-review/:id", reviewController.getReviewsForAllPlace);
router.patch("/edit-likes/:id", reviewController.increaseOrReduceReviewsLikes);
router.patch("/:id", reviewController.editReviewDetails);
router.patch(
  "/:id/add-images",
  multerUploadsMultiple,
  reviewController.addReviewImages
);
router.patch("/:id/remove-images", reviewController.removeReviewImages);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
