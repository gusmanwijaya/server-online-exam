const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");
const Dosen = require("../../models/dosen");
const Kelas = require("../../models/kelas");
const Mahasiswa = require("../../models/mahasiswa");
const MataKuliah = require("../../models/mata-kuliah");
const ProgramStudi = require("../../models/program-studi");

module.exports = {
  dashboard: async (req, res) => {
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

      const lengthDosen = await Dosen.countDocuments();
      const lengthKelas = await Kelas.countDocuments();
      const lengthMahasiswa = await Mahasiswa.countDocuments();
      const lengthMataKuliah = await MataKuliah.countDocuments();
      const lengthProgramStudi = await ProgramStudi.countDocuments();

      res.render("admin/dashboard/index", {
        alert,
        url: originalUrl[2],
        title: "Dashboard",
        payload,
        lengthDosen,
        lengthKelas,
        lengthMahasiswa,
        lengthMataKuliah,
        lengthProgramStudi,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/dashboard");
    }
  },
};
