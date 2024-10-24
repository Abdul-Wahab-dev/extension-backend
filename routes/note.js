const express = require("express");
const {
  createNote,
  getAllNote,
  updateNote,
  deleteNote,
  getAllNoteDomains,
  getAllURLBaseNotes,
} = require("../controllers/note");
const { protect, checkLimit } = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .post(protect, checkLimit, createNote)
  .get(protect, getAllNote);

router
  .route("/:id")
  .put(protect, checkLimit, updateNote)
  .delete(protect, deleteNote);
router.route("/domain").get(protect, getAllNoteDomains);
router.route("/test").get((req, res) => {
  res.send("Everything alright!");
});

router.route("/url").get(protect, getAllURLBaseNotes);
// router.route("/urls").get(protect, getAllUrls);

module.exports = router;
