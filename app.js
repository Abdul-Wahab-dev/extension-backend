const express = require("express");
const morgan = require("morgan");
// const helmet = require("helmet");
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
    credentials: true,
    // origin: "*",
    origin: "http://localhost:3000",
  })
);
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// express body-parser
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// data sanitization  against NoSQL query injection
app.use(mongoSanitize());
// data sanitization  against xss
app.use(xss());
// prevent parameter pollution
app.use(hpp());
// 2) Routes
app.get("/api/v1/health", (req, res) => {
  res.send("hello");
});
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/content", contentRouter);
app.use("/api/v1/collection", customCollectionRouter);
app.use("/api/v1/setting", settingRoutes);

app.use(globalErrorHandler);

module.exports = app;
