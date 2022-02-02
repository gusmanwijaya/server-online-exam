const Checksum = require("../../models/checksum");
const Dosen = require("../../models/dosen");

const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");
const sha256File = require("sha256-file");
const crypto = require("crypto");

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

      res.render("lecturer/checksum/detail/index", {
        alert,
        url: originalUrl[2],
        title: "Checksum",
        payload,
        idMatkul,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/checksum/${idMatkul}`);
    }
  },
  storeChecksum: async (req, res) => {
    const { idMatkul } = req.params;

    try {
      if (req.file) {
        const digestFileUnggah = sha256File(req.file.path);
        const checksumDb = await Checksum.findOne({ mataKuliah: idMatkul });
        if (!checksumDb) {
          req.flash("alertStatus", "error");
          req.flash(
            "alertMessage",
            `File hasil ujian untuk mata kuliah tersebut belum tersedia, silahkan generate dan unduh file hasil ujian terlebih dahulu!`
          );
          res.redirect(`/lecturer/checksum/${idMatkul}`);
        } else {
          const algorithm = "aes-256-cbc";

          let iv = base64decode(checksumDb.digest.iv);
          let key = base64decode(checksumDb.digest.key);
          let message = base64decode(checksumDb.digest.message);

          let decipher = crypto.createDecipheriv(algorithm, key, iv);

          let dataDecrypted = decipher.update(message, "hex", "utf-8");
          let decrypted = dataDecrypted + decipher.final("utf-8");

          checksumDb.digest.message = decrypted;

          if (digestFileUnggah !== checksumDb.digest.message) {
            req.flash("alertStatus", "error");
            req.flash(
              "alertMessage",
              `File yang Anda unggah tidak terdaftar pada sistem kami!`
            );
            res.redirect(`/lecturer/checksum/${idMatkul}`);
          } else {
            req.flash("alertStatus", "success");
            req.flash(
              "alertMessage",
              `File yang Anda unggah terdaftar pada sistem kami!`
            );
            res.redirect(`/lecturer/checksum/${idMatkul}`);
          }
        }
      } else {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Silahkan unggah file terlebih dahulu!`);
        res.redirect(`/lecturer/checksum/${idMatkul}`);
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/checksum/${idMatkul}`);
    }
  },
};
