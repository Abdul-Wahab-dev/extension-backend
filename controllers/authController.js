const User = require("../models/User");
const { Content } = require("../models/Content");
const { CustomCollection } = require("../models/CustomCollection");
const { createCustomerHelper } = require("./subscription");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const crypto = require("crypto");
const Validator = require("validator");
const isEmpty = require("../validation/is-empty");
const APIFeature = require("../utils/apiFeatures");

// const validateRegisterInput = require("../validation/register");
const { OAuth2Client } = require("google-auth-library");
const { promisify } = require("util");
const sendEmail = require("../utils/email");
const { generateJwtToken } = require("../utils/generateToken");
const { oauthClient } = require("../config/oauth");
const { serialize } = require("cookie");
const { Package } = require("../models/Package");
// @route               POST /api/v1/user/signup
// @desc                create new user
// @access              Public
exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check Validation
  if (!name || !email || !password) {
    return next(new AppError(`Fields Required`, 400, null));
  }

  // check user exist with is email or not
  const existUser = await User.findOne({ email });

  if (existUser) {
    return next(
      new AppError("User already exist with this E-mail", 400, undefined)
    );
  }
  const customer = await createCustomerHelper(email);
  const user = await User.create({
    email,
    name,
    password,
    customerId: customer.id,
  });
  if (!user) {
    throw new AppError("Failed to create a user", 400, null);
  }

  res.status(201).json({
    user,
  });
});
// @route               POST /api/v1/user/login
// @desc                login user
// @access              Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if email and password exist
  if (!email || !password) {
    return next(
      new AppError("email and password is required!", 400, undefined)
    );
  }
  // 2) check if user exist and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError("username or password incorrect!", 400, undefined)
    );
  }
  // 3) check user blocked or not
  // if (!user || user.blocked === true) {
  //   return next(new AppError("user blocked!", 400, undefined));
  // }
  // 4) if everything OK then send token to user
  const token = generateJwtToken(
    { id: user.id, name: user.name, email: user.email },
    "7d"
  );

  res.setHeader(
    "Set-Cookie",
    serialize("authorization", `Bearer ${token}`, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
  );

  res.status(200).json({
    token,
    user: user,
  });
});

// @route               POST /api/v1/user/google-login
// @desc                generate google login url
// @access              Public
exports.googleLogin = catchAsync(async (req, res) => {
  const { return_uri } = req.query;

  const stateObj = {
    return_uri,
  };
  const authUrl = oauthClient.generateAuthUrl({
    access_type: "online",
    prompt: "consent",
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    redirect_uri: process.env.REDIRECT_URL,
    state: return_uri,
  });

  res.setHeader("Access-Control-Allow-Origin", "*");

  return res.status(200).json({ url: authUrl });
});

exports.googleAuthCallback = catchAsync(async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    throw new AppError("code is required", 400, null);
  }

  const { tokens } = await oauthClient.getToken(code);

  const { payload } = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
  });

  const email = payload.email;
  const firstName = payload.given_name;
  const lastName = payload.family_name;

  // Check if user already exists
  let user = await User.findOne({
    email,
  });

  if (!user) {
    const customer = await createCustomerHelper(email);
    user = await User.create({
      email,
      name: firstName + " " + lastName,
      customerId: customer.id,
    });
    // sending welcome email
  }

  const token = generateJwtToken(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    "7d"
  );

  res.setHeader(
    "Set-Cookie",
    serialize("authorization", `Bearer ${token}`, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })
  );

  let redirect_uri = `${state}`;

  return res.redirect(307, redirect_uri);
});

// @route                   GET /api/v1/users/custom-token
// @desc                    get custom token
// @access                  private
// exports.getCustomToken = catchAsync(async (req, res, next) => {
//   let token;
//   // 1) getting token and check if token exist
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   } else {
//     return next(new AppError("unauthorized user", 401, undefined));
//   }

//   const uid = (await adminAuth.verifyIdToken(token)).uid;
//   if (!uid) return next(new AppError("Invalid token", 400, undefined));

//   const customToken = await adminAuth.createCustomToken(uid);

//   return res.status(200).json({
//     token: customToken,
//   });
// });

const client = new OAuth2Client(
  "532893321001-gefd5pi11rf25s8tkqd5n7er3phqcuu6.apps.googleusercontent.com"
);

// @route                 POST /api/v1/users/login-with-google
// @desc                  login with google
// @access                Public
exports.loginWithGoogle = catchAsync(async (req, res, next) => {
  // check token
  const tokenVerify = await oauthClient.verifyIdToken({
    idToken: req.body.token,
    audience:
      "5328933atg64221001-gefd5asdy234pi11rf25s8tkqd5n7er3phqcuu6fds.apps.googleusercontent.com",
  });

  if (!tokenVerify) {
    return next(new AppError("Bad request", 400, undefined));
  }
  const { name, email, picture } = tokenVerify.payload;

  // 2) check if user exist and password is correct
  const user = await User.findOne({ email });
  if (!user) {
    return next(
      new AppError("username or password incorrect!", 400, undefined)
    );
  }

  // 4) if everything OK then send token to user
  const token = generateJwtToken;

  res.status(200).json({
    status: "success",
    token,
  });
});

// verift route check token is verify
exports.verifyGoogleToken = catchAsync(async (req, res, next) => {
  // check token
  if (!req.body.token) {
    return next(new AppError("Error in Sign up with google"));
  }
  const tokenVerify = await client.verifyIdToken({
    idToken: req.body.token,
    audience:
      "532893321001-gefd5pi11rf25s8tkqd5n7er3phqcuu6.apps.googleusercontent.com",
  });
  // console.log(tokenVerify);
  if (!tokenVerify) {
    return next(new AppError("Bad request", 400, undefined));
  }
  const { name, email, picture } = tokenVerify.payload;

  req.body.name = name.toLowerCase();
  req.body.email = email.toLowerCase();
  next();
});
// Protected Route

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) getting token and check if token exist

  if (
    req.cookies &&
    req.cookies.authorization &&
    req.cookies.authorization.split(" ") &&
    req.cookies.authorization.split(" ").length > 0
  ) {
    token = req.cookies.authorization.split(" ")[1];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    return next(new AppError("unauthorized user", 401, undefined));
  }

  // 2) verify token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) check user still exist
  const currentUser = await User.findById(decode.id).select("-__v -password");
  if (!currentUser) {
    return next(new AppError("User not exist", 404));
  }

  // 4) check password does'nt change after the token issued

  if (currentUser.changedPassword(decode.iat)) {
    return next(
      new AppError("user recently changed password Please login again", 400)
    );
  }

  // grant access to protected routes

  req.user = currentUser;

  next();
});

// restrictTO

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission", 403, undefined));
    }
    next();
  };
};
// @route         GET /api/v1/users/current-user
// @desc          get current or logged in user
// @access        Private
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  const currentUser = await User.findById(req.user.id).select("-__v -password");
  if (!currentUser) {
    next(new AppError("user not found or not logged in", 401, undefined));
  }
  const totalContent = await Content.countDocuments({
    user: req.user._id,
  });
  const totalCollection = await CustomCollection.countDocuments({
    user: req.user._id,
  });
  const package = await Package.findOne({
    user: req.user._id,
  });
  return res.status(200).json({
    user: {
      name: currentUser.name,
      email: currentUser.email,
      _id: currentUser._id,
      totalCollection,
      totalContent,
      package,
    },
  });
});
// @route         POST /api/v1/user/forgetPassword
// @desc          send reset password token
// @access        Public
exports.forgetPassword = catchAsync(async (req, res, next) => {
  if (Validator.isEmpty(req.body.email)) {
    return next(new AppError("E-mail is required", 400, undefined));
  }

  if (!Validator.isEmail(req.body.email)) {
    return next(new AppError("E-mail is invalid", 400, undefined));
  }
  // get user based on email

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError("User does not exist with this mail", 404, undefined)
    );
  }

  // generate reset token
  const resetToken = await user.resetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) send it to user's email

  const resetURL = `${req.protocol}://${process.env.WEBSITE_DOMAIN}/reset-password/${resetToken}`;
  // const resetURL = `${req.protocol}://localhost:3000/reset-password`;

  const message = `Forget your password?Click on Link to submit a request with your new password to ${resetURL}`;

  await sendEmail({
    email: user.email,
    subject: "Your password reset token only valid for 10 min",
    message,
  });
  res.status(200).json({
    status: "success",
    message: "token sent to email",
  });
});

// @route         POST /api/v1/user/resetPassword
// @desc          reset password
// @access        Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user base on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token has not expired, and there is user , set the new password
  if (!user) {
    // return res.status(400).send("token is invalud or has expired");
    return next(
      new AppError("token is invalud or has expired", 400, undefined)
    );
  }

  // console.log(req.body.password);
  // console.log(isEmpty(req.body));
  // console.log(Validator.isEmpty(req.body.password));
  if (
    Validator.isEmpty(req.body.password) ||
    Validator.isEmpty(req.body.passwordConfirm)
  ) {
    return next(new AppError("Fields required", 400, undefined));
  }
  if (!Validator.isLength(req.body.password, { min: 6, max: 30 })) {
    return next(
      new AppError("password must be at least 6 characters", 400, undefined)
    );
  }

  if (!Validator.equals(req.body.password, req.body.passwordConfirm)) {
    return next(new AppError("password must be matched", 400, undefined));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "password successfully changed!",
  });
});

// @route         POST /api/v1/user/updatePassword
// @desc          update password
// @access        Private
exports.updatePassword = catchAsync(async (req, res, next) => {
  const errors = {};
  if (!req.body.currentPassword) {
    errors.currentPassword = "currend password is required";
  }
  if (!req.body.password) {
    errors.password = "password is required";
  }
  if (
    req.body.password !== req.body.passwordConfirm ||
    !req.body.passwordConfirm
  ) {
    errors.passwordConfirm = "confirm password must be match with password";
  }
  if (req.body.password.length < 8) {
    errors.password = "password must be greater";
  }

  if (Object.keys(errors).length > 0) {
    return next(new AppError("Fields required", 400, errors));
  }
  // 1) get user from collection
  const user = await User.findById(req.user.id).select("+password");
  // 2) check if posted current password is correct
  if (
    !user ||
    !(await user.correctPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError("user not valid", 400, undefined));
  }
  // 3) if so. update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();

  res.status(201).json({
    status: "success",
    message: "user successfully update password!",
  });
});

// @route              /api/v1/user/all-users
// @desc               get all user
// @access             Private
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeature(User.find(), req.query)
    .filter()
    .sort()
    .limitField()
    .pagination();

  const users = await features.query;

  const totalFilterDocs = new APIFeature(User.find(), req.query)
    .filter()
    .totalFilterDocs();
  const totalDocs = await totalFilterDocs;
  // send response to client
  res.status(200).json({
    status: "success",
    users,
    result: users.length,
    totalDocs,
  });
});

// @route                   /api/v1/user/:id
// @desc                    get user by id
// @access                  admin-only
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404, undefined));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

// @route                  /api/v1/user/blocked
// @desc                   blocked user
// @access                 admin-only
exports.blockedUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { blocked: req.body.blocked },
    { new: true, runValidators: true }
  );
  if (!user) {
    return next(new AppError("user not found", 404, undefined));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});
// @route                  /api/v1/user/deleted
// @desc                   deleted user
// @access                 admin-only
exports.deletedUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { deleted: req.body.blocked },
    { new: true, runValidators: true }
  );
  if (!user) {
    return next(new AppError("user not found", 404, undefined));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

// @route                   POST /api/v1/users/logout
// @desc                    logout current user
// @access                  Private
exports.userLogout = catchAsync(async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    serialize("authorization", ``, {
      httpOnly: true,
      maxAge: 0,
      path: "/",
    })
  );
  res.status(200).json({
    success: true,
  });
});

// exports.verifyToken = async (req, res, next) => {
//   const idToken = req.headers.authorization?.split("Bearer ")[1];
//   console.log(idToken);
//   if (!idToken) {
//     return res.status(401).send("Unauthorized");
//   }

//   try {
//     const decodedToken = await adminAuth.verifyIdToken(idToken);
//     req.user = decodedToken;
//     next();
//   } catch (error) {
//     console.log({ error });
//     return res.status(401).send("Unauthorized");
//   }
// };
