const MataKuliah = require("../../models/mata-kuliah");
const Kelas = require("../../models/kelas");
const ProgramStudi = require("../../models/program-studi");

const dateAndTime = require("date-and-time");
const dateNow = new Date();

module.exports = {
  mataKuliah: async (req, res) => {
    try {
      const originalUrl = req.originalUrl.split("/");

      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };

      const mataKuliahs = await MataKuliah.find()
        .populate("kelas", "_id nama", "Kelas")
        .populate("programStudi", "_id nama", "ProgramStudi")
        .sort({ nama: "asc" });
      const classes = await Kelas.find().sort({ nama: "asc" });
      const programStudies = await ProgramStudi.find().sort({ nama: "asc" });

      res.render("admin/mata-kuliah/index", {
        alert,
        mataKuliahs,
        classes,
        programStudies,
        url: originalUrl[2],
        title: "Mata Kuliah",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mata-kuliah");
    }
  },
  storeMataKuliah: async (req, res) => {
    try {
      const { nama, kelas, programStudi } = req.body;

      await MataKuliah.create({ nama, kelas, programStudi });

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `MataKuliah ${nama} berhasil ditambahkan!`);
      res.redirect("/admin/mata-kuliah");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mata-kuliah");
    }
  },
  updateMataKuliah: async (req, res) => {
    try {
      const { id, nama, kelas, programStudi } = req.body;

      await MataKuliah.findOneAndUpdate(
        { _id: id },
        {
          nama,
          kelas,
          programStudi,
          updatedAt: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
        }
      );

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `MataKuliah berhasil diubah!`);
      res.redirect("/admin/mata-kuliah");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mata-kuliah");
    }
  },
  destroyMataKuliah: async (req, res) => {
    try {
      const { valueList } = req.body;

      if (valueList.length === 0) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Maaf, Anda harus memilih satu atau beberapa data untuk dihapus!`
        );
        res.redirect("/admin/mata-kuliah");
      } else {
        const idArray = valueList.split(",");
        await MataKuliah.remove({ _id: { $in: idArray } });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `MataKuliah berhasil dihapus!`);
        res.redirect("/admin/mata-kuliah");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mata-kuliah");
    }
  },
};
