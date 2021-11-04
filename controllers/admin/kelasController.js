const Kelas = require("../../models/kelas");

const dateAndTime = require("date-and-time");
const dateNow = new Date();

module.exports = {
  kelas: async (req, res) => {
    try {
      const originalUrl = req.originalUrl.split("/");

      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };

      const classes = await Kelas.find().sort({ nama: "asc" });

      res.render("admin/kelas/index", {
        alert,
        classes,
        url: originalUrl[2],
        title: "Kelas",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/kelas");
    }
  },
  storeKelas: async (req, res) => {
    try {
      const { nama } = req.body;

      await Kelas.create({ nama });

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Kelas ${nama} berhasil ditambahkan!`);
      res.redirect("/admin/kelas");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/kelas");
    }
  },
  updateKelas: async (req, res) => {
    try {
      const { id, nama } = req.body;

      await Kelas.findOneAndUpdate(
        { _id: id },
        {
          nama,
          updatedAt: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
        }
      );

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Kelas berhasil diubah!`);
      res.redirect("/admin/kelas");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/kelas");
    }
  },
  destroyKelas: async (req, res) => {
    try {
      const { valueList } = req.body;

      if (valueList.length === 0) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Maaf, Anda harus memilih satu atau beberapa data untuk dihapus!`
        );
        res.redirect("/admin/kelas");
      } else {
        const idArray = valueList.split(",");
        await Kelas.remove({ _id: { $in: idArray } });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `Kelas berhasil dihapus!`);
        res.redirect("/admin/kelas");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/kelas");
    }
  },
};