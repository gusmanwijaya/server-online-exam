const ProgramStudi = require("../../models/program-studi");
const MataKuliah = require("../../models/mata-kuliah");
const Dosen = require("../../models/dosen");

const dateAndTime = require("date-and-time");
const dateNow = new Date();
const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");

module.exports = {
  dosen: async (req, res) => {
    try {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));

      const originalUrl = req.originalUrl.split("/");

      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };

      const dosens = await Dosen.find()
        .populate("mataKuliah")
        .populate("programStudi", "_id nama", "ProgramStudi");

      res.render("admin/dosen/index", {
        alert,
        dosens,
        payload,
        url: originalUrl[2],
        title: "Dosen",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/dosen");
    }
  },
  createDosen: async (req, res) => {
    try {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));

      const originalUrl = req.originalUrl.split("/");

      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };
      const programStudies = await ProgramStudi.find().sort({ nama: "asc" });
      const mataKuliahs = await MataKuliah.find().sort({ nama: "asc" });

      res.render("admin/dosen/create", {
        alert,
        programStudies,
        mataKuliahs,
        payload,
        url: originalUrl[2],
        title: "Dosen",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/dosen");
    }
  },
  storeDosen: async (req, res) => {
    try {
      const {
        nama,
        nip,
        email,
        password,
        jenisKelamin,
        mataKuliah,
        programStudi,
      } = req.body;

      if (password.length < 10) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Password harus lebih dari sama dengan (>=) 10 karakter!`
        );
        res.redirect("/admin/dosen");
      } else {
        await Dosen.create({
          nama,
          nip,
          email,
          password: {
            message: password,
          },
          jenisKelamin,
          mataKuliah,
          programStudi,
        });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `${nama} berhasil ditambahkan!`);
        res.redirect("/admin/dosen");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/dosen");
    }
  },
  editDosen: async (req, res) => {
    try {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));

      const { id } = req.params;
      const originalUrl = req.originalUrl.split("/");

      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };

      const dosen = await Dosen.findOne({ _id: id });
      const programStudies = await ProgramStudi.find().sort({ nama: "asc" });
      const mataKuliahs = await MataKuliah.find().sort({ nama: "asc" });

      res.render("admin/dosen/edit", {
        alert,
        dosen,
        programStudies,
        mataKuliahs,
        payload,
        url: originalUrl[2],
        title: "Dosen",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/dosen");
    }
  },
  updateDosen: async (req, res) => {
    try {
      const { id } = req.params;

      const { jenisKelamin, mataKuliah } = req.body;

      await Dosen.findOneAndUpdate(
        { _id: id },
        {
          jenisKelamin,
          mataKuliah,
          updatedAt: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
        }
      );

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Dosen berhasil diubah!`);
      res.redirect("/admin/dosen");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/dosen");
    }
  },
  destroyDosen: async (req, res) => {
    try {
      const { valueList } = req.body;

      if (valueList.length === 0) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Maaf, Anda harus memilih satu atau beberapa data untuk dihapus!`
        );
        res.redirect("/admin/dosen");
      } else {
        const idArray = valueList.split(",");
        await Dosen.remove({ _id: { $in: idArray } });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `Dosen berhasil dihapus!`);
        res.redirect("/admin/dosen");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/dosen");
    }
  },
};
