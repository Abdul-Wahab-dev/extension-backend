const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { Note } = require("../models/Note");
const { Package } = require("../models/Package");

// @route                   POST /api/v1/note
// @desc                    create note
// @access                  Private
exports.createNote = catchAsync(async (req, res, next) => {
  const { title, collections, shareWith, description, url, domain } = req.body;

  if (!title || !url || !domain) {
    throw new AppError("title is required", 400, null);
  }

  const note = await Note.create({
    title,
    collections: collections || [],
    description,
    shareWith: shareWith || [],
    url,
    domain,
    user: req.user._id,
  });

  if (!note) {
    return next(new AppError("Failed to create the new content", 400, null));
  }

  Package.updateOne(
    {
      user: req.user._id,
    },
    {
      $inc: {
        noteLimit: -1,
      },
    }
  );
  delete note.disabled;
  const newNote = await Note.findById(note._id)
    .populate({
      path: "sharedBy",
      select: "name email",
    })
    .select("-updated_at -__v -created_at -disabled");
  res.status(201).json({
    note: newNote,
  });
});

// @route                   GET /api/v1/note
// @desc                    get all note
// @access                  Private
exports.getAllNote = catchAsync(async (req, res, next) => {
  const { domain, page, limit } = req.query;

  const l_page = page * 1 || 1;
  const l_limit = limit * 1 || 5;
  const skip = (l_page - 1) * l_limit;
  const filters = {
    disabled: false,
    $or: [{ user: req.user._id }, { shareWith: req.user.email }],
  };
  if (domain) {
    filters.domain = domain;
  }
  const notes = await Note.find(filters)
    .populate({
      path: "sharedBy",
      select: "name email",
    })
    .skip(skip)
    .limit(l_limit)
    .sort("-created_at")
    .select("-updated_at -__v -created_at -disabled");

  const total = await Note.countDocuments(filters);

  if (!notes || !notes.length) {
    return res.status(200).json({
      notes: [],
      total,
    });
  }
  return res.status(200).json({
    notes,
    total,
  });
});

// @route                   PUT /api/v1/note/:id
// @desc                    update note
// @access                  Private
exports.updateNote = catchAsync(async (req, res, next) => {
  const { title, description, collections, shareWith } = req.body;
  const { id } = req.params;

  if (!id) {
    throw new AppError("invalid params");
  }
  const note = await Note.findById(id);
  if (!note) {
    throw new AppError("invalid params");
  }

  const updatedNoteObj = {
    title,
    description,
  };

  if (note.user == req.user._id) {
    updatedNoteObj.collections = collections || [];
    updatedNoteObj.shareWith = shareWith || [];
  }

  const updatedNote = await Note.findOneAndUpdate(
    {
      _id: id,
      $or: [{ user: req.user._id }, { shareWith: req.user.email }],
    },
    {
      ...updatedNoteObj,
    },
    {
      upsert: true,
      new: true,
    }
  ).select("-updated_at -__v -created_at -disabled");
  if (!updatedNote) {
    return next(new AppError("Failed to update the content", 400, null));
  }

  res.status(200).json({
    note: updatedNote,
  });
});

// @route                   DELETE /api/v1/note/:id
// @desc                    delete note
// @access                  Private
exports.deleteNote = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("id is required to delete the note", 400, null));
  }
  const updatedNote = await Note.findOneAndUpdate(
    {
      _id: id,
      user: req.user.id,
    },
    {
      disabled: true,
    }
  );
  if (!updatedNote) {
    return next(new AppError("Failed to update the note", 400, null));
  }

  res.status(200).json({
    note: updatedNote,
  });
});

// @route                   GET /api/v1/note/domain
// @desc                    get all note domains
// @access                  Private
exports.getAllNoteDomains = catchAsync(async (req, res, next) => {
  let domains = await Note.aggregate([
    {
      $match: {
        $or: [{ user: req.user._id }, { shareWith: req.user.email }],
        disabled: false,
      },
    },
    {
      $group: {
        _id: "$domain",
      },
    },
    {
      $project: {
        _id: 0,
        domain: "$_id",
      },
    },
  ]);
  if (!domains) {
    return res.status(200).json({
      domains: [],
    });
  }

  res.status(200).json({
    domains,
  });
});

// @route                   GET /api/v1/note/url/:url
// @desc                    get all note that has the url
// @access                  Private
exports.getAllURLBaseNotes = catchAsync(async (req, res, next) => {
  const { url, page, limit } = req.query;
  const l_page = page * 1 || 1;
  const l_limit = limit * 1 || 5;
  const skip = (l_page - 1) * l_limit;

  if (!url) {
    return res.status(200).json({
      contents: [],
    });
  }

  const notes = await Note.find({
    disabled: false,
    url: url,
    $or: [{ user: req.user._id }, { shareWith: req.user.email }],
  })
    .skip(skip)
    .limit(l_limit);

  const total = await Note.countDocuments({
    disabled: false,
    url: url,
    $or: [{ user: req.user._id }, { shareWith: req.user.email }],
  });

  if (!notes || !notes.length) {
    return res.status(200).json({
      notes: [],
      total: 0,
    });
  }

  return res.status(200).json({
    notes,
    total,
  });
});
