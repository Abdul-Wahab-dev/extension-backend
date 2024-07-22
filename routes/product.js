const express = require("express");
const { getProductList } = require("../controllers/product");
const { protect } = require("../controllers/authController");
const router = express.Router();

router.route("/").get(getProductList);

module.exports = router;
