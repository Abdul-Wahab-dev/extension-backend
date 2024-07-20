const express = require("express");

const { create, webook } = require("../controllers/subscription");
const { protect } = require("../controllers/authController");
const router = express.Router();

router.route("/").post(protect, create);

module.exports = router;
