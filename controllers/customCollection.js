const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { CustomCollection } = require("../models/CustomCollection");
const { Content } = require("../models/Content");

// @route                   POST /api/v1/collection
// @desc                    create collection
// @access                  Private
exports.createCollection = catchAsync(async (req, res, next) => {
  const { title, domains } = req.body;

  if (!title) {
    return next(
      new AppError("Fields required", 400, { title: "title is required" })
    );
  }
  const newCollection = await CustomCollection.create({
    title,
    sites: domains,
    user: req.user._id,
  });

  if (!newCollection) {
    return next(new AppError("Failed to create the new content", 400, null));
  }

  res.status(201).json({
    collection: newCollection,
  });
});

// @route                   GET /api/v1/collection
// @desc                    get all collection
// @access                  Private
exports.getAllCollections = catchAsync(async (req, res, next) => {
  const { domain, page, limit } = req.query;
  const l_page = page * 1 || 1;
  const l_limit = limit * 1 || 5;
  const skip = (l_page - 1) * l_limit;
  let collections = null;
  const filters = {
    disabled: false,
    $or: [{ user: req.user._id }, { shareWith: req.user.email }],
  };
  if (domain) filters.sites = domain;

  collections = await CustomCollection.find({ ...filters })
    .populate({
      path: "sharedBy",
      select: "name email",
    })
    .skip(skip)
    .limit(l_limit)
    .sort("-created_at");

  let total = 0;

  total = await CustomCollection.countDocuments({ ...filters });

  if (!collections) {
    return res.status(200).json({
      collections: [],
      total,
    });
  }
  return res.status(200).json({
    collections,
    total,
  });
});
// @route                   GET /api/v1/collection/:id
// @desc                    get collection by id
// @access                  Private
exports.getCollectionById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return new AppError("unique id is required", 400, null);

  let collection = await CustomCollection.findOne({
    $or: [{ user: req.user._id }, { shareWith: req.user.email }],
    _id: id,
  }).populate("contents");

  if (!collection)
    return new AppError("no record found with this id", 404, null);
  return res.status(200).json({
    collection,
  });
});

// @route                   PUT /api/v1/collection/:id
// @desc                    update collection
// @access                  Private
exports.updateCollection = catchAsync(async (req, res, next) => {
  const { title, domains, shareWith } = req.body;
  const { id } = req.params;
  console.log(title, "title");
  console.log(domains, "title");
  console.log(shareWith, "title");
  const updatedCollection = await CustomCollection.findOneAndUpdate(
    {
      _id: id,
      user: req.user.id,
    },
    {
      sites: domains || [],
      title: title || "",
      shareWith: shareWith || [],
    },
    {
      new: true,
    }
  ).select("-disabled -created_at -updated_at");
  if (!updatedCollection) {
    return next(
      new AppError(
        "Failed to update the collection or user does not have permissions",
        400,
        null
      )
    );
  }

  res.status(200).json({
    collection: updatedCollection,
  });
});

// @route                   DELETE /api/v1/collection/:id
// @desc                    delete collection
// @access                  Private
exports.deleteCollection = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(
      new AppError("Unique is required to delete the collection", 400, null)
    );
  }
  const updatedContent = await CustomCollection.findOneAndUpdate(
    { _id: id, user: req.user._id },
    {
      disabled: true,
    }
  );
  if (!updatedContent) {
    return next(new AppError("Failed to update the content", 400, null));
  }

  res.status(200).json({
    collection: updatedContent,
  });
});

// @route                   POST /api/v1/collection/content/add
// @desc                    add content in the collection
// @access                  Private
exports.addContentIntoCollection = catchAsync(async (req, res, next) => {
  const { contentId, collectionId } = req.body;
  if (!contentId && !collectionId) {
    return next(new AppError("content or collection is required", 400, null));
  }
  const content = await Content.findByIdAndUpdate(
    contentId,
    {
      $addToSet: {
        collections: collectionId,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  if (!content) {
    return next(new AppError("content is not updated", 400, null));
  }

  return res.status(200).json({
    content,
  });
});
// @route                   POST /api/v1/collection/content/remove
// @desc                    add content in the collection
// @access                  Private
exports.removeContentFromCollection = catchAsync(async (req, res, next) => {
  const { contentId, collectionId } = req.body;
  if (!contentId && !collectionId) {
    return next(new AppError("content or collection is required", 400, null));
  }
  const content = await Content.findByIdAndUpdate(
    contentId,
    {
      $pull: {
        collections: collectionId,
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  if (!content) {
    return next(new AppError("content is not updated", 400, null));
  }

  return res.status(200).json({
    content,
  });
});
