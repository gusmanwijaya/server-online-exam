const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// START: Library npm yang diinstall
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
// END: Library npm yang diinstall

// START: Router
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
// END: Router

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// START: Menggunakan library yang diinstall
app.use(
  session({
    secret: "perintis karya",
    resave: false,
    saveUninitialized: true,
    cookie: {},
  })
);
app.use(flash());
app.use(methodOverride("_method"));
// END: Menggunakan library yang diinstall

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// START: Menggunakan router
app.use("/", authRouter);
app.use("/admin", adminRouter);
// END: Menggunakan router

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
