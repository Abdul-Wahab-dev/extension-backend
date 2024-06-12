const express = require("express");
const {
  createContent,
  getAllContent,
  updateContent,
  deleteContent,
  getAllContentDomains,
} = require("../controllers/content");
const { protect } = require("../controllers/authController");
const router = express.Router();

router.route("/").post(protect, createContent).get(protect, getAllContent);

router.route("/:id").put(protect, updateContent).delete(protect, deleteContent);
router.route("/domain").get(protect, getAllContentDomains);
router.route("/test").get((req, res) => {
  res.send("Everything alright!");
});

module.exports = router;
