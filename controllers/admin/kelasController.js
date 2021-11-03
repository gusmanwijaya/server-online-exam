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

      const classes = await Kelas.find();

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
      const { id } = req.body;

      await Kelas.findOneAndDelete({ _id: id });

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Kelas berhasil dihapus!`);
      res.redirect("/admin/kelas");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/kelas");
    }
  },
};
