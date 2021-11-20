const BankSoal = require("../../models/bank-soal");
const Dosen = require("../../models/dosen");
const MataKuliah = require("../../models/mata-kuliah");
const JadwalUjian = require("../../models/jadwal-ujian");

const dateAndTime = require("date-and-time");
const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");
const randomString = require("randomstring");

module.exports = {
  jadwalUjian: async (req, res) => {
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

      const jadwalUjians = await JadwalUjian.find()
        .populate("dosen")
        .populate("mataKuliah");

      res.render("lecturer/jadwal-ujian/index", {
        alert,
        url: originalUrl[2],
        title: "Jadwal Ujian",
        payload,
        jadwalUjians,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/jadwal-ujian");
    }
  },
  createJadwalUjian: async (req, res) => {
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

      const dosenMatkuls = await Dosen.findOne({
        _id: payload.data._id,
      }).populate({
        path: "mataKuliah",
        populate: {
          path: "programStudi",
          model: "ProgramStudi",
        },
      });

      res.render("lecturer/jadwal-ujian/create", {
        alert,
        url: originalUrl[2],
        title: "Tambah Jadwal Ujian",
        payload,
        dosenMatkuls,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
    }
  },
  storeJadwalUjian: async (req, res) => {
    try {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));

      const {
        mataKuliah,
        namaUjian,
        jumlahSoal,
        durasiUjian,
        mulaiUjian,
        terlambatUjian,
      } = req.body;

      if (mataKuliah === "") {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Mata kuliah harus diisi!`);
        res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
      }

      if (namaUjian === "") {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Nama ujian harus diisi!`);
        res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
      }

      if (jumlahSoal === "") {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Jumlah soal harus diisi!`);
        res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
      }

      if (durasiUjian === "") {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Durasi ujian harus diisi!`);
        res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
      }

      if (mulaiUjian === "") {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Waktu mulai ujian harus diisi!`);
        res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
      }

      if (terlambatUjian === "") {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Batas waktu terlambat mengikuti ujian harus diisi!`
        );
        res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
      }

      const tokenUjian = randomString.generate({
        length: 6,
        charset: "alphabetic",
      });
      const jamMulaiUjian = mulaiUjian.split("T")[1];
      const tanggalMulaiUjian = mulaiUjian.split("T")[0].split("-")[2];
      const bulanMulaiUjian = mulaiUjian.split("T")[0].split("-")[1];
      const tahunMulaiUjian = mulaiUjian.split("T")[0].split("-")[0];
      const formatMulaiUjian = `${tanggalMulaiUjian}-${bulanMulaiUjian}-${tahunMulaiUjian} ${jamMulaiUjian}`;

      const jamTerlambatUjian = terlambatUjian.split("T")[1];
      const tanggalTerlambatUjian = terlambatUjian.split("T")[0].split("-")[2];
      const bulanTerlambatUjian = terlambatUjian.split("T")[0].split("-")[1];
      const tahunTerlambatUjian = terlambatUjian.split("T")[0].split("-")[0];
      const formatTerlambatUjian = `${tanggalTerlambatUjian}-${bulanTerlambatUjian}-${tahunTerlambatUjian} ${jamTerlambatUjian}`;

      const jadwalUjianInDb = await JadwalUjian.findOne({
        mataKuliah: mataKuliah,
      });
      const countSoalUjian = await BankSoal.countDocuments({
        mataKuliah: mataKuliah,
      });
      if (jadwalUjianInDb) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Jadwal ujian untuk mata kuliah tersebut sudah ada!`
        );
        res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
      } else {
        if (jumlahSoal > countSoalUjian) {
          req.flash("alertStatus", "error");
          req.flash(
            "alertMessage",
            `Jumlah soal yang Anda miliki hanya ${countSoalUjian} soal!`
          );
          res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
        } else {
          await JadwalUjian.create({
            dosen: payload.data._id,
            mataKuliah,
            namaUjian,
            jumlahSoal,
            durasiUjian,
            mulaiUjian: formatMulaiUjian,
            terlambatUjian: formatTerlambatUjian,
            token: tokenUjian.toUpperCase(),
          });

          req.flash("alertStatus", "success");
          req.flash("alertMessage", `Jadwal ujian berhasil ditambahkan!`);
          res.redirect("/lecturer/jadwal-ujian");
        }
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/jadwal-ujian/create-jadwal-ujian");
    }
  },
};
