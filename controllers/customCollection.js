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
  if (domain)
    collections = await CustomCollection.find({
      sites: domain,
      user: req.user._id,
      disabled: false,
    })
      .skip(skip)
      .limit(l_limit)
      .sort("-created_at");
  else
    collections = await CustomCollection.find({
      user: req.user._id,
      disabled: false,
    })
      .skip(skip)
      .limit(l_limit)
      .sort("-created_at");

  let total = 0;
  if (domain)
    total = await CustomCollection.countDocuments({
      sites: domain,
      user: req.user._id,
      disabled: false,
    });
  else
    total = await CustomCollection.countDocuments({
      user: req.user._id,
      disabled: false,
    });

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
    user: req.user._id,
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
  const { title, domains } = req.body;
  const { id } = req.params;

  const updatedCollection = await CustomCollection.findOneAndUpdate(
    {
      _id: id,
      user: req.user.id,
    },
    {
      sites: domains,
      title,
    },
    {
      upsert: true,
      new: true,
    }
  );
  if (!updatedCollection) {
    return next(new AppError("Failed to update the collection", 400, null));
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
  const updatedContent = await CustomCollection.findByIdAndUpdate(id, {
    disabled: true,
  });
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
