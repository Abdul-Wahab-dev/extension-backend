const router = require("express").Router();
const { protect } = require("../controllers/authController");
const { Package } = require("../models/Package");
const mongoose = require("mongoose");
router.route("/").post(protect, async (req, res) => {
  const { email, _id } = req.user;
  const newPackage = await Package.create({
    user: _id,
    contentLimit: 0,
    plan: "",
    status: "",
    subEndDate: "",
  });

  return res.status(201).json({
    newPackage,
  });
});
module.exports = router;
