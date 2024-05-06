const express = require("express");
const router = express.Router();
// const authController = require("../controllers/authController");
// const userController = require("../controllers/user");

// // signup route
// router.post("/signup", authController.signup);

// // login route
// router.post("/login", authController.login);
// // login with google
// router.post("/login-with-google", authController.loginWithGoogle);
// // forget password route
// router.post("/forgetPassword", authController.forgetPassword);
// // reset password route
// router.post("/resetPassword/:token", authController.resetPassword);
// // change password
// router.post(
//   "/updatePassword",
//   authController.protect,
//   authController.updatePassword
// );
// router
//   .route("/current-user")
//   .get(authController.protect, authController.getCurrentUser)
//   .patch(authController.protect, userController.updateCurrentUser);

// router.post("/subscribe", userController.subscribe);
// router.get("/all-users", authController.getAllUsers);
// router.route("/ads/:userID").get(userController.userAds);
// router.patch("/deleted/:id", authController.deletedUser);
// router.patch("/blocked/:id", authController.blockedUser);
// router.route("/:id").get(authController.getUserById);
router.route("/test").get((req, res) => {
  res.send(200);
});
module.exports = router;
