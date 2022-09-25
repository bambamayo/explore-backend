const express = require("express");
const placeController = require("../controllers/placeController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    placeController.getAllPlaces
  )
  .post(placeController.createPlace);

router
  .route("/:id")
  .get(placeController.getOnePlace)
  .patch(placeController.editPlaceDetails);

module.exports = router;
