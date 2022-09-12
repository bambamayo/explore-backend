const express = require("express");
const placeController = require("../controllers/placeController");

const router = express.Router();

router.get("/", placeController.getAllPlaces);
router.post("/", placeController.createPlace);

router.get("/:id", placeController.getOnePlace);
router.patch("/:id", placeController.editPlaceDetails);

module.exports = router;
