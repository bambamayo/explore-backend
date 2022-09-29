const express = require("express");
const placeController = require("../controllers/placeController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.protect, placeController.getAllPlaces)
  .post(authController.protect, placeController.createPlace);

router
  .route("/:id")
  .get(authController.protect, placeController.getOnePlace)
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    placeController.editPlaceDetails
  );

module.exports = router;
