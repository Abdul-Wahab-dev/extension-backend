const express = require("express");

const { create, update } = require("../controllers/subscription");
const { create } = require("../controllers/customer/index");
const router = express.Router();

router.route("/").post(protect, create);

module.exports = router;
