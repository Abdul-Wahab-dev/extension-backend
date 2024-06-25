const express = require("express");
const {
  createCollection,
  getAllCollections,
  addContentIntoCollection,
  removeContentFromCollection,
  updateCollection,
  deleteCollection,
  getCollectionById,
} = require("../controllers/customCollection");
const { protect } = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .post(protect, createCollection)
  .get(protect, getAllCollections);
router.route("/content/add").post(protect, addContentIntoCollection);
router.route("/content/remove").post(protect, removeContentFromCollection);
router
  .route("/:id")
  .put(protect, updateCollection)
  .delete(protect, deleteCollection)
  .get(protect, getCollectionById);
// router.route("/domain").get(protect, getAllContentDomains);
router.route("/test").get((req, res) => {
  res.send("Everything alright!");
});

module.exports = router;
