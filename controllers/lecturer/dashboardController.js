const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");
const crypto = require("crypto");
const Dosen = require("../../models/dosen");
const BankSoal = require("../../models/bank-soal");
const Mahasiswa = require("../../models/mahasiswa");
const JadwalUjian = require("../../models/jadwal-ujian");
const Checksum = require("../../models/checksum");

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

      const dosen = await Dosen.findOne({ _id: payload.data._id }).populate({
        path: "mataKuliah",
        populate: {
          path: "programStudi",
          model: "ProgramStudi",
        },
      });
      const lengthMataKuliahDosen = dosen?.mataKuliah.length;

      const lengthBankSoal = await BankSoal.countDocuments({
        dosen: payload.data._id,
      });

      const lengthMahasiswa = await Mahasiswa.countDocuments();

      const lengthJadwalUjian = await JadwalUjian.countDocuments({
        dosen: payload.data._id,
      });

      let checksum = await Checksum.find({
        mataKuliah: { $in: dosen.mataKuliah },
      }).populate({
        path: "mataKuliah",
        model: "MataKuliah",
      });

      if (checksum.length > 0) {
        checksum.forEach((element) => {
          const algorithm = "aes-256-cbc";

          let iv = base64decode(element.digest.iv);
          let key = base64decode(element.digest.key);
          let message = base64decode(element.digest.message);

          let decipher = crypto.createDecipheriv(algorithm, key, iv);

          let dataDecrypted = decipher.update(message, "hex", "utf-8");
          let decrypted = dataDecrypted + decipher.final("utf-8");

          element.digest.message = decrypted;
        });
      }

      res.render("lecturer/dashboard/index", {
        alert,
        url: originalUrl[2],
        title: "Dashboard",
        payload,
        lengthMataKuliahDosen,
        lengthBankSoal,
        lengthMahasiswa,
        lengthJadwalUjian,
        checksum,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/dashboard");
    }
  },
};
