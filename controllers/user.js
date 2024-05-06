const User = require("../models/User");
const Subscription = require("../models/SubscriptionEmail");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

// @route                   PATCH /api/v1/users/current-user
// @desc                    update current user
// @access                  Private
exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  if (!user) {
    next(new AppError("user could not update", 400, undefined));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// @route                   GET /api/v1/users/ads/userID
// @desc                    get all ads
// @access                  Public
exports.userAds = catchAsync(async (req, res, next) => {
  if (Object.keys(req.query).length > 0) {
    Object.keys(req.query).forEach((ele) => {
      if (req.query[ele].length === 0) {
        delete req.query[ele];
      }
    });
  }

  const ads = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.params.userID),
      },
    },
    {
      $lookup: {
        from: "jobs",
        localField: "_id",
        foreignField: "user",

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$active", true] },
                  { $eq: ["$deleted", false] },
                  {
                    $eq: ["$user", mongoose.Types.ObjectId(req.params.userID)],
                  },
                  req.query && req.query.title && req.query.title.length > 0
                    ? { $eq: ["$title", req.query.title] }
                    : {},
                  req.query && req.query.country && req.query.country.length > 0
                    ? { $eq: ["$country", req.query.country] }
                    : {},
                  req.query && req.query.county && req.query.county.length > 0
                    ? { $eq: ["$county", req.query.county] }
                    : {},
                  req.query && req.query.city && req.query.city.length > 0
                    ? { $eq: ["$city", req.query.city] }
                    : {},
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              country: 1,
              adType: 1,
              category: 1,
              minSalary: 1,
              maxSalary: 1,
              promoteType: 1,
              images: 1,
              currency: 1,
              salaryType: 1,
            },
          },
        ],
        as: "job",
      },
    },

    {
      $lookup: {
        from: "surplus",
        localField: "_id",
        foreignField: "user",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$active", true] },
                  { $eq: ["$deleted", false] },
                  {
                    $eq: ["$user", mongoose.Types.ObjectId(req.params.userID)],
                  },

                  req.query && req.query.title && req.query.title.length > 0
                    ? { $eq: ["$title", req.query.title] }
                    : {},
                  req.query && req.query.country && req.query.country.length > 0
                    ? { $eq: ["$country", req.query.country] }
                    : {},
                  req.query && req.query.county && req.query.county.length > 0
                    ? { $eq: ["$county", req.query.county] }
                    : {},
                  req.query && req.query.city && req.query.city.length > 0
                    ? { $eq: ["$city", req.query.city] }
                    : {},
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              title: 1,
              country: 1,
              adType: 1,
              category: 1,
              originalPrice: 1,
              offeredPrice: 1,
              promoteType: 1,
              images: 1,
              currency: 1,
            },
          },
        ],
        as: "surplus",
      },
    },
    {
      $lookup: {
        from: "jobseekers",
        localField: "_id",
        foreignField: "user",
        // let: { deleted: "$deleted", active: "$active" },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$active", true] },
                  { $eq: ["$deleted", false] },
                  {
                    $eq: ["$user", mongoose.Types.ObjectId(req.params.userID)],
                  },
                  req.query && req.query.title && req.query.title.length > 0
                    ? { $eq: ["$title", req.query.title] }
                    : {},
                  req.query && req.query.country && req.query.country.length > 0
                    ? { $eq: ["$country", req.query.country] }
                    : {},
                  req.query && req.query.county && req.query.county.length > 0
                    ? { $eq: ["$county", req.query.county] }
                    : {},
                  req.query && req.query.city && req.query.city.length > 0
                    ? { $eq: ["$city", req.query.city] }
                    : {},
                ],
              },
            },
          },

          {
            $project: {
              _id: 1,
              title: 1,
              country: 1,
              adType: 1,
              category: 1,
              name: 1,
              images: 1,
              rate: 1,
              currency: 1,
            },
          },
        ],
        as: "jobSeeker",
      },
    },
    {
      $project: {
        _id: 0,
        surplus: "$surplus",
        job: "$job",
        jobSeeker: "$jobSeeker",
      },
    },
  ]);
  if (ads.length === 0) {
    return next(new AppError("Not found", 404, undefined));
  }

  res.status(200).json({
    ads: [
      ...ads[ads.length - 1].surplus,
      ...ads[ads.length - 1].job,
      ...ads[ads.length - 1].jobSeeker,
    ],
  });
});

// @route                   GET /api/v1/users/subscribe
// @desc                    user subscribe to newsletter
// @access                  Public
exports.subscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400, undefined));
  }
  const subscribe = await Subscription.findOne({ email });
  if (subscribe) {
    return res.status(200).json({
      status: "success",
      message: "Aleady Subscribed!",
    });
  }
  const newSubscribe = await Subscription.create({ email });
  if (!newSubscribe) {
    return next(new AppError("can not subscribe. Please try again later"));
  }

  res.status(201).json({
    status: "success",
    message: "Subscribed!",
  });
});
