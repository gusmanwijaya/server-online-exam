require("dotenv").config();
const HasilUjian = require("../../models/hasil-ujian");
const Dosen = require("../../models/dosen");
const MataKuliah = require("../../models/mata-kuliah");
const JadwalUjian = require("../../models/jadwal-ujian");
const Checksum = require("../../models/checksum");

const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");
const crypto = require("crypto");
const pdf = require("pdf-creator-node");
const path = require("path");
const fs = require("fs");
const config = require("../../config");
const sha256File = require("sha256-file");

const options = require("../../helpers/options");

module.exports = {
  mataKuliahHasilUjian: async (req, res) => {
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

      res.render("lecturer/hasil-ujian/index", {
        alert,
        url: originalUrl[2],
        title: "Hasil Ujian",
        payload,
        dosen,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/hasil-ujian");
    }
  },
  hasilUjian: async (req, res) => {
    const { id } = req.params;

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

      const mataKuliah = await MataKuliah.findOne({ _id: id });
      const jadwalUjian = await JadwalUjian.findOne({
        mataKuliah: mataKuliah._id,
      });

      let hasilUjians;
      if (!jadwalUjian) {
        hasilUjians = "";
      } else {
        hasilUjians = await HasilUjian.find({
          jadwalUjian: jadwalUjian._id,
        })
          .populate("jadwalUjian")
          .populate("mahasiswa");

        const algorithm = "aes-256-cbc";
        for (let hasilUjian of hasilUjians) {
          let ivListJawaban = base64decode(hasilUjian.listJawaban.iv);
          let keyListJawaban = base64decode(hasilUjian.listJawaban.key);
          let messageListJawaban = base64decode(hasilUjian.listJawaban.message);

          let decipherListJawaban = crypto.createDecipheriv(
            algorithm,
            keyListJawaban,
            ivListJawaban
          );

          let dataDecryptedListJawaban = decipherListJawaban.update(
            messageListJawaban,
            "hex",
            "utf-8"
          );
          let decryptedListJawaban =
            dataDecryptedListJawaban + decipherListJawaban.final("utf-8");

          hasilUjian.listJawaban.message = decryptedListJawaban;

          let ivJumlahBenar = base64decode(hasilUjian.jumlahBenar.iv);
          let keyJumlahBenar = base64decode(hasilUjian.jumlahBenar.key);
          let messageJumlahBenar = base64decode(hasilUjian.jumlahBenar.message);

          let decipherJumlahBenar = crypto.createDecipheriv(
            algorithm,
            keyJumlahBenar,
            ivJumlahBenar
          );

          let dataDecryptedJumlahBenar = decipherJumlahBenar.update(
            messageJumlahBenar,
            "hex",
            "utf-8"
          );
          let decryptedJumlahBenar =
            dataDecryptedJumlahBenar + decipherJumlahBenar.final("utf-8");

          hasilUjian.jumlahBenar.message = decryptedJumlahBenar;

          let ivNilai = base64decode(hasilUjian.nilai.iv);
          let keyNilai = base64decode(hasilUjian.nilai.key);
          let messageNilai = base64decode(hasilUjian.nilai.message);

          let decipherNilai = crypto.createDecipheriv(
            algorithm,
            keyNilai,
            ivNilai
          );

          let dataDecryptedNilai = decipherNilai.update(
            messageNilai,
            "hex",
            "utf-8"
          );
          let decryptedNilai =
            dataDecryptedNilai + decipherNilai.final("utf-8");

          hasilUjian.nilai.message = decryptedNilai;
        }
      }

      res.render("lecturer/hasil-ujian/detail/index", {
        alert,
        url: originalUrl[2],
        title: "Hasil Ujian",
        payload,
        mataKuliah,
        hasilUjians,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/hasil-ujian/${id}`);
    }
  },
  detailHasilUjian: async (req, res) => {
    const { idMatkul, idHasilUjian } = req.params;

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
      const jadwalUjian = await JadwalUjian.findOne({
        mataKuliah: mataKuliah._id,
      });

      let hasilUjian;

      if (!jadwalUjian) {
        hasilUjian = "";
      } else {
        hasilUjian = await HasilUjian.findOne({
          _id: idHasilUjian,
        })
          .populate({
            path: "jadwalUjian",
            populate: {
              path: "mataKuliah",
              model: "MataKuliah",
            },
          })
          .populate("mahasiswa");

        const algorithm = "aes-256-cbc";
        let ivListJawaban = base64decode(hasilUjian.listJawaban.iv);
        let keyListJawaban = base64decode(hasilUjian.listJawaban.key);
        let messageListJawaban = base64decode(hasilUjian.listJawaban.message);

        let decipherListJawaban = crypto.createDecipheriv(
          algorithm,
          keyListJawaban,
          ivListJawaban
        );

        let dataDecryptedListJawaban = decipherListJawaban.update(
          messageListJawaban,
          "hex",
          "utf-8"
        );
        let decryptedListJawaban =
          dataDecryptedListJawaban + decipherListJawaban.final("utf-8");

        hasilUjian.listJawaban.message = decryptedListJawaban;

        let ivJumlahBenar = base64decode(hasilUjian.jumlahBenar.iv);
        let keyJumlahBenar = base64decode(hasilUjian.jumlahBenar.key);
        let messageJumlahBenar = base64decode(hasilUjian.jumlahBenar.message);

        let decipherJumlahBenar = crypto.createDecipheriv(
          algorithm,
          keyJumlahBenar,
          ivJumlahBenar
        );

        let dataDecryptedJumlahBenar = decipherJumlahBenar.update(
          messageJumlahBenar,
          "hex",
          "utf-8"
        );
        let decryptedJumlahBenar =
          dataDecryptedJumlahBenar + decipherJumlahBenar.final("utf-8");

        hasilUjian.jumlahBenar.message = decryptedJumlahBenar;

        let ivNilai = base64decode(hasilUjian.nilai.iv);
        let keyNilai = base64decode(hasilUjian.nilai.key);
        let messageNilai = base64decode(hasilUjian.nilai.message);

        let decipherNilai = crypto.createDecipheriv(
          algorithm,
          keyNilai,
          ivNilai
        );

        let dataDecryptedNilai = decipherNilai.update(
          messageNilai,
          "hex",
          "utf-8"
        );
        let decryptedNilai = dataDecryptedNilai + decipherNilai.final("utf-8");

        hasilUjian.nilai.message = decryptedNilai;
      }

      res.render("lecturer/hasil-ujian/detail/detail", {
        alert,
        url: originalUrl[2],
        title: "Hasil Ujian",
        payload,
        mataKuliah,
        hasilUjian,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(
        `/lecturer/hasil-ujian/${idMatkul}/detail-hasil-ujian/${idHasilUjian}`
      );
    }
  },
  generatePdf: async (req, res) => {
    const html = fs.readFileSync(
      path.join(__dirname, "../../views/pdf/template.html"),
      "utf-8"
    );

    const { idMatkul } = req.params;

    const mataKuliah = await MataKuliah.findOne({ _id: idMatkul });
    const jadwalUjian = await JadwalUjian.findOne({
      mataKuliah: mataKuliah._id,
    });
    let hasilUjians = await HasilUjian.find({ jadwalUjian: jadwalUjian._id })
      .populate({
        path: "jadwalUjian",
        populate: [
          {
            path: "dosen",
            model: "Dosen",
          },
          {
            path: "mataKuliah",
            model: "MataKuliah",
          },
        ],
      })
      .populate({
        path: "mahasiswa",
        populate: {
          path: "programStudi",
          model: "ProgramStudi",
        },
      });

    hasilUjians.forEach((hasilUjian) => {
      const algorithm = "aes-256-cbc";
      let ivListJawaban = base64decode(hasilUjian.listJawaban.iv);
      let keyListJawaban = base64decode(hasilUjian.listJawaban.key);
      let messageListJawaban = base64decode(hasilUjian.listJawaban.message);

      let decipherListJawaban = crypto.createDecipheriv(
        algorithm,
        keyListJawaban,
        ivListJawaban
      );

      let dataDecryptedListJawaban = decipherListJawaban.update(
        messageListJawaban,
        "hex",
        "utf-8"
      );
      let decryptedListJawaban =
        dataDecryptedListJawaban + decipherListJawaban.final("utf-8");

      hasilUjian.listJawaban.message = decryptedListJawaban;

      let ivJumlahBenar = base64decode(hasilUjian.jumlahBenar.iv);
      let keyJumlahBenar = base64decode(hasilUjian.jumlahBenar.key);
      let messageJumlahBenar = base64decode(hasilUjian.jumlahBenar.message);

      let decipherJumlahBenar = crypto.createDecipheriv(
        algorithm,
        keyJumlahBenar,
        ivJumlahBenar
      );

      let dataDecryptedJumlahBenar = decipherJumlahBenar.update(
        messageJumlahBenar,
        "hex",
        "utf-8"
      );
      let decryptedJumlahBenar =
        dataDecryptedJumlahBenar + decipherJumlahBenar.final("utf-8");

      hasilUjian.jumlahBenar.message = decryptedJumlahBenar;

      let ivNilai = base64decode(hasilUjian.nilai.iv);
      let keyNilai = base64decode(hasilUjian.nilai.key);
      let messageNilai = base64decode(hasilUjian.nilai.message);

      let decipherNilai = crypto.createDecipheriv(algorithm, keyNilai, ivNilai);

      let dataDecryptedNilai = decipherNilai.update(
        messageNilai,
        "hex",
        "utf-8"
      );
      let decryptedNilai = dataDecryptedNilai + decipherNilai.final("utf-8");

      hasilUjian.nilai.message = decryptedNilai;
    });

    const token = req.session.user.token;
    const payload = jwt_decode(base64decode(token));
    const dosen = await Dosen.findOne({ _id: payload.data._id });

    const fileName = `Hasil Ujian - ${mataKuliah.nama}.pdf`;

    let array = [];

    hasilUjians.forEach((hasilUjian) => {
      const hslUjian = {
        namaMahasiswa: hasilUjian.mahasiswa.nama,
        npmMahasiswa: hasilUjian.mahasiswa.npm,
        jumlahBenar: hasilUjian.jumlahBenar.message,
        nilai: hasilUjian.nilai.message,
        waktuMulai: hasilUjian.masuk,
        waktuSelesai: hasilUjian.selesai,
      };
      array.push(hslUjian);
    });

    const obj = {
      arrayHasilUjian: array,
      namaDosen: dosen.nama,
      namaUjian: jadwalUjian.namaUjian,
      namaMataKuliah: mataKuliah.nama,
    };

    const document = {
      html,
      data: {
        hasilUjian: obj,
      },
      path: `./public/docs/${fileName}`,
    };

    pdf
      .create(document, options)
      .then(() => {
        req.flash("alertStatus", "success");
        req.flash(
          "alertMessage",
          `Berhasil generate file PDF, silahkan unduh.`
        );
        res.redirect(`/lecturer/hasil-ujian/${idMatkul}`);
      })
      .catch((error) => {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `${error.message}`);
        res.redirect(`/lecturer/hasil-ujian/${idMatkul}`);
      });
  },
  downloadPdf: async (req, res) => {
    const { idMatkul } = req.params;

    try {
      const mataKuliah = await MataKuliah.findOne({ _id: idMatkul });

      const fileName = `Hasil Ujian - ${mataKuliah.nama}.pdf`;
      const path = `${config.rootPath}/public/docs/${fileName}`;

      if (fs.existsSync(path)) {
        const anyPathChecksum = await Checksum.findOne({
          mataKuliah: mataKuliah._id,
        });
        if (anyPathChecksum) {
          await Checksum.findOneAndDelete({ mataKuliah: mataKuliah._id });
        }
        await Checksum.create({
          mataKuliah: mataKuliah._id,
          digest: {
            message: sha256File(path),
          },
        });
        res.download(path);
      } else {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `File pdf belum tersedia, silahkan klik tombol generate pdf terlebih dahulu!`
        );
        res.redirect(`/lecturer/hasil-ujian/${idMatkul}`);
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/hasil-ujian/${idMatkul}`);
    }
  },
};
