const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
// const userController = require("../controllers/user");

// // signup route
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router
  .route("/current-user")
  .get(authController.protect, authController.getCurrentUser);
router.route("/google-login").get(authController.googleLogin);

router.route("/logout").get(authController.userLogout);
router.route("/google/callback").get(authController.googleAuthCallback);
router.route("/test").get((req, res) => {
  res.send(200);
});
module.exports = router;
