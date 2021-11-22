require("../local-storage/index");
const jwt_decode = require("jwt-decode");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { base64decode } = require("nodejs-base64");

const Mahasiswa = require("../models/mahasiswa");

module.exports = {
  isNotSendEmailOTP: async (req, res, next) => {
    const isAnyDataLocalStorage = localStorage.getItem("data");
    if (!isAnyDataLocalStorage) {
      req.flash("alertStatus", "error");
      req.flash(
        "alertMessage",
        "Mohon maaf, Anda tidak memiliki hak untuk mengakses!"
      );
      res.redirect("/sign-in");
    } else {
      next();
    }
  },
  isAdmin: async (req, res, next) => {
    if (req.session.user === null || req.session.user === undefined) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", "Mohon maaf, silahkan lakukan login dahulu!");
      res.redirect("/sign-in");
    } else {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));

      if (payload.data.role === 1) {
        next();
      } else {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          "Mohon maaf, Anda tidak memiliki hak untuk mengakses!"
        );
        res.redirect("/lecturer/dashboard");
      }
    }
  },
  isLecturer: async (req, res, next) => {
    if (req.session.user === null || req.session.user === undefined) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", "Mohon maaf, silahkan lakukan login dahulu!");
      res.redirect("/sign-in");
    } else {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));

      if (payload.data.role === 0) {
        next();
      } else {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          "Mohon maaf, Anda tidak memiliki hak untuk mengakses!"
        );
        res.redirect("/admin/dashboard");
      }
    }
  },
  isMahasiswa: async (req, res, next) => {
    try {
      const token = req.headers.authorization
        ? req.headers.authorization.replace("Bearer ", "")
        : null;
      const data = jwt.verify(token, config.jwtKey);

      const mahasiswa = await Mahasiswa.findOne({
        _id: data.mahasiswa._id,
      }).populate("programStudi");

      if (!mahasiswa) {
        throw new Error();
      }

      delete mahasiswa._doc.password;

      req.mahasiswa = mahasiswa;
      req.token = token;
      next();
    } catch (error) {
      res.status(401).json({
        status: "error",
        message: "Mohon maaf, silahkan lakukan login dahulu!",
      });
    }
  },
};
