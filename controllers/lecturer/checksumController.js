const Checksum = require("../../models/checksum");
const MataKuliah = require("../../models//mata-kuliah");
const Dosen = require("../../models/dosen");
const JadwalUjian = require("../../models/jadwal-ujian");
const HasilUjian = require("../../models/hasil-ujian");
const config = require("../../config");
const options = require("../../helpers/options");

const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");
const sha256File = require("sha256-file");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-creator-node");

module.exports = {
  checksumMataKuliah: async (req, res) => {
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

      res.render("lecturer/checksum/index", {
        alert,
        url: originalUrl[2],
        title: "Checksum",
        payload,
        dosen,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/checksum");
    }
  },
  checksum: async (req, res) => {
    const { idMatkul } = req.params;

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

      const mataKuliah = await MataKuliah.findOne({ _id: idMatkul });

      res.render("lecturer/checksum/detail/index", {
        alert,
        url: originalUrl[2],
        title: "Checksum",
        payload,
        mataKuliah,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/checksum/${idMatkul}`);
    }
  },
  periksaChecksum: async (req, res) => {
    const { idMatkul } = req.params;

    try {
      const mataKuliah = await MataKuliah.findOne({ _id: idMatkul });
      const fileName = `Hasil Ujian - ${mataKuliah.nama}.pdf`;
      const pathFileDocs = `${config.rootPath}/public/docs/${fileName}`;

      let checksumFileDb = await Checksum.findOne({
        mataKuliah: mataKuliah._id,
      });

      if (fs.existsSync(pathFileDocs) && checksumFileDb) {
        const algorithm = "aes-256-cbc";

        let iv = base64decode(checksumFileDb.digest.iv);
        let key = base64decode(checksumFileDb.digest.key);
        let message = base64decode(checksumFileDb.digest.message);

        let decipher = crypto.createDecipheriv(algorithm, key, iv);

        let dataDecrypted = decipher.update(message, "hex", "utf-8");
        let decrypted = dataDecrypted + decipher.final("utf-8");

        checksumFileDb.digest.message = decrypted;

        const checksumFileServer = sha256File(pathFileDocs);

        if (checksumFileServer !== checksumFileDb.digest.message) {
          req.flash("alertStatus", "error");
          req.flash(
            "alertMessage",
            `Oops, hasil ujian tidak terdaftar pada sistem kami, nampaknya data hasil ujian mata kuliah ${mataKuliah.nama} tidak asli lagi!`
          );
          res.redirect(`/lecturer/checksum/${idMatkul}`);
        } else {
          req.flash("alertStatus", "success");
          req.flash(
            "alertMessage",
            `Hasil ujian terdaftar pada sistem kami dengan digest: ${checksumFileServer}, data hasil ujian mata kuliah ${mataKuliah.nama} asli!`
          );
          res.redirect(`/lecturer/checksum/${idMatkul}`);
        }
      } else {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Silahkan konfirmasi hasil ujian terlebih dahulu pada menu hasil ujian mata kuliah ${mataKuliah.nama}!`
        );
        res.redirect(`/lecturer/checksum/${idMatkul}`);
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/checksum/${idMatkul}`);
    }
  },
};
