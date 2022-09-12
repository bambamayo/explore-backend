const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post("/", categoryController.createCategory);

router.patch("/:id", categoryController.editCategoryDetails);

module.exports = router;
