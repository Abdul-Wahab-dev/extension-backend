const express = require("express");
const morgan = require("morgan");
// const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");

const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const globalErrorHandler = require("./controllers/errorController");

const hpp = require("hpp");
const cors = require("cors");
const compression = require("compression");
const app = express();
const userRoutes = require("./routes/user");
const settingRoutes = require("./routes/setting");
const customCollectionRouter = require("./routes/customCollection");
const contentRouter = require("./routes/content");
const productRouter = require("./routes/product");
const subscriptionRouter = require("./routes/subscription");
const packageRouter = require("./routes/package");
const webhookRouter = require("./routes/webhook");
const billingPortalRouter = require("./routes/billingPortal");

// 1) GLOBAL MIDDLLEWARES
// set security HTTP headers
// app.use(
//   helmet.contentSecurityPolicy({
//     useDefaults: false,
//     directives: {
//       "default-src": ["'self'", "'unsafe-inline'"],
//       "style-src": ["'self' https: data: *"],
//       "img-src": ["'self' data: blob:", "futjan.s3.ap-south-1.amazonaws.com"],
//       "font-src": ["'self' https: data:", "fonts.googleapis.com"],
//     },
//   })
// );

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://flexisaves.toolefy.com",
      "https://flexisaves.web.toolefy.com",
      "https://proxy.toolefy.com",
    ],
    credentials: true,
  })
);
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// express body-parser
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 30, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});
app.use(limiter);
app.use(compression());
app.use("/api", express.json());
app.use(express.urlencoded({ extended: true }));

// data sanitization  against NoSQL query injection
app.use(mongoSanitize());
// data sanitization  against xss
app.use(xss());
// prevent parameter pollution
app.use(hpp());
// 2) Routes
app.get("/api/v1/health", (req, res) => {
  res.send("ok");
});
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/collection", customCollectionRouter);
app.use("/api/v1/setting", settingRoutes);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/subscription", subscriptionRouter);
app.use("/api/v1/package", packageRouter);
app.use("/payment", webhookRouter);
app.use("/api/v1/billing-portal", billingPortalRouter);

app.use(globalErrorHandler);

module.exports = app;
