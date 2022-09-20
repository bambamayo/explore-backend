const express = require("express");
const reviewController = require("../controllers/reviewsController");

const router = express.Router();

router.get("/", reviewController.getAllReviews);
router.post("/", reviewController.createReview);

router.get("/:id", reviewController.getOneReview);
router.get("/places-review/:id", reviewController.getReviewsForAllPlace);
router.patch("/edit-likes/:id", reviewController.increaseOrReduceReviewsLikes);
router.patch("/:id", reviewController.editReviewDetails);

module.exports = router;
