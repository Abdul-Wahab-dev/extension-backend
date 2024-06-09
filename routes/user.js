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
router.route("/custom-token").get(authController.getCustomToken);
router.route("/test").get((req, res) => {
  res.send(200);
});
module.exports = router;
