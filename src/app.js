const express = require("express");
const morgan = require("morgan");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const placeRouter = require("./routes/placeRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const commentRouter = require("./routes/commentRoutes");
const { cloudinaryConfig } = require("./utils/cloudinaryConfig");

const app = express();

/***
 MIDDLEWARES
 ***/
//Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

//Cors
app.use(cors());

//Cloudinary
app.use("*", cloudinaryConfig);

//Security HTTP header
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
  })
);

//Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});
app.use("/api", limiter);

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

/***
 END OF MIDDLEWARES
 ***/

//Routes
app.use("/api/v1/places", placeRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/comments", commentRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
