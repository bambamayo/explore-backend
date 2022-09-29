const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("../controllers/userController");
const { multerUploads } = require("../utils/multer");

const router = express.Router();

router.get("/me", authController.protect, userController.getMe);

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.post("/forgot-password", authController.forgotPassword);
router.patch("/reset-password/:token", authController.resetPassword);
router.patch(
  "/update-my-password",
  authController.protect,
  authController.updatePassword
);

router.patch("/update-me", authController.protect, userController.updateMe);
router.patch(
  "/update-avatar",
  authController.protect,
  multerUploads,
  userController.updateProfilePicture
);
router.patch(
  "/remove-avatar",
  authController.protect,
  userController.deleteProfilePicture
);
router.delete(
  "/delete-me",
  authController.protect,
  userController.deleteMyAccount
);

module.exports = router;
