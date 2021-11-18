const Dosen = require("../../models/dosen");
const BankSoal = require("../../models/bank-soal");
const MataKuliah = require("../../models/mata-kuliah");

const fs = require("fs");
const path = require("path");
const config = require("../../config");
const dateAndTime = require("date-and-time");
const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");
const crypto = require("crypto");

module.exports = {
  bankSoal: async (req, res) => {
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

      res.render("lecturer/bank-soal/index", {
        alert,
        url: originalUrl[2],
        title: "Bank Soal",
        payload,
        dosen,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/bank-soal");
    }
  },
  soal: async (req, res) => {
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
      let bankSoals = await BankSoal.find({ mataKuliah: id })
        .populate("dosen")
        .populate("mataKuliah");

      for (let bankSoal of bankSoals) {
        let algorithm = "aes-256-cbc";
        let iv = base64decode(bankSoal.soal.iv);
        let key = base64decode(bankSoal.soal.key);
        let message = base64decode(bankSoal.soal.message);

        let decipher = crypto.createDecipheriv(algorithm, key, iv);

        let dataDecrypted = decipher.update(message, "hex", "utf-8");
        let decrypted = dataDecrypted + decipher.final("utf-8");

        bankSoal.soal.message = decrypted;
      }

      res.render("lecturer/bank-soal/soal/index", {
        alert,
        url: originalUrl[2],
        title: "Soal",
        payload,
        bankSoals,
        mataKuliah,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/bank-soal/${id}`);
    }
  },
  createSoal: async (req, res) => {
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

      const abjads = ["A", "B", "C", "D", "E"];
      const mataKuliah = await MataKuliah.findOne({ _id: id });

      res.render("lecturer/bank-soal/soal/create", {
        alert,
        url: originalUrl[2],
        title: "Tambah Soal",
        payload,
        mataKuliah,
        abjads,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
    }
  },
  storeSoal: async (req, res) => {
    const { id } = req.params;

    try {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));

      const {
        soal,
        pilihanA,
        pilihanB,
        pilihanC,
        pilihanD,
        pilihanE,
        kunciJawaban,
        bobot,
      } = req.body;

      let newBankSoal = await BankSoal({
        dosen: payload.data._id,
        mataKuliah: id,
        bobot,
        soalGambar: "",
        soal: {
          message: "",
        },
        pilihanA: {
          message: "",
        },
        pilihanB: {
          message: "",
        },
        pilihanC: {
          message: "",
        },
        pilihanD: {
          message: "",
        },
        pilihanE: {
          message: "",
        },
        pilihanGambarA: "",
        pilihanGambarB: "",
        pilihanGambarC: "",
        pilihanGambarD: "",
        pilihanGambarE: "",
        kunciJawaban: {
          message: "",
        },
      });

      if (soal === "" && !req.files["soalGambar"]) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Soal ujian harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      } else {
        if (soal !== "") {
          newBankSoal.soal.message = soal.replace(/(<([^>]+)>)/gi, "");
        }

        if (req.files["soalGambar"]) {
          const filePath = req.files["soalGambar"][0].path;
          const originalExtension =
            req.files["soalGambar"][0].originalname.split(".")[
              req.files["soalGambar"][0].originalname.split(".").length - 1
            ];
          const fileName =
            req.files["soalGambar"][0].filename + "." + originalExtension;
          const targetPath = path.resolve(
            config.rootPath,
            `public/uploads/soal-gambar/${fileName}`
          );

          const src = fs.createReadStream(filePath);
          const dest = fs.createWriteStream(targetPath);

          src.pipe(dest);
          newBankSoal.soalGambar = fileName;
        }
      }

      if (pilihanA === "" && !req.files["pilihanGambarA"]) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban A harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      } else {
        if (pilihanA !== "") {
          newBankSoal.pilihanA.message = pilihanA.replace(/(<([^>]+)>)/gi, "");
        }

        if (req.files["pilihanGambarA"]) {
          const filePath = req.files["pilihanGambarA"][0].path;
          const originalExtension =
            req.files["pilihanGambarA"][0].originalname.split(".")[
              req.files["pilihanGambarA"][0].originalname.split(".").length - 1
            ];
          const fileName =
            req.files["pilihanGambarA"][0].filename + "." + originalExtension;
          const targetPath = path.resolve(
            config.rootPath,
            `public/uploads/pilihan-gambar/${fileName}`
          );

          const src = fs.createReadStream(filePath);
          const dest = fs.createWriteStream(targetPath);

          src.pipe(dest);
          newBankSoal.pilihanGambarA = fileName;
        }
      }

      if (pilihanB === "" && !req.files["pilihanGambarB"]) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban B harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      } else {
        if (pilihanB !== "") {
          newBankSoal.pilihanB.message = pilihanB.replace(/(<([^>]+)>)/gi, "");
        }

        if (req.files["pilihanGambarB"]) {
          const filePath = req.files["pilihanGambarB"][0].path;
          const originalExtension =
            req.files["pilihanGambarB"][0].originalname.split(".")[
              req.files["pilihanGambarB"][0].originalname.split(".").length - 1
            ];
          const fileName =
            req.files["pilihanGambarB"][0].filename + "." + originalExtension;
          const targetPath = path.resolve(
            config.rootPath,
            `public/uploads/pilihan-gambar/${fileName}`
          );

          const src = fs.createReadStream(filePath);
          const dest = fs.createWriteStream(targetPath);

          src.pipe(dest);
          newBankSoal.pilihanGambarB = fileName;
        }
      }

      if (pilihanC === "" && !req.files["pilihanGambarC"]) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban C harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      } else {
        if (pilihanC !== "") {
          newBankSoal.pilihanC.message = pilihanC.replace(/(<([^>]+)>)/gi, "");
        }

        if (req.files["pilihanGambarC"]) {
          const filePath = req.files["pilihanGambarC"][0].path;
          const originalExtension =
            req.files["pilihanGambarC"][0].originalname.split(".")[
              req.files["pilihanGambarC"][0].originalname.split(".").length - 1
            ];
          const fileName =
            req.files["pilihanGambarC"][0].filename + "." + originalExtension;
          const targetPath = path.resolve(
            config.rootPath,
            `public/uploads/pilihan-gambar/${fileName}`
          );

          const src = fs.createReadStream(filePath);
          const dest = fs.createWriteStream(targetPath);

          src.pipe(dest);
          newBankSoal.pilihanGambarC = fileName;
        }
      }

      if (pilihanD === "" && !req.files["pilihanGambarD"]) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban D harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      } else {
        if (pilihanD !== "") {
          newBankSoal.pilihanD.message = pilihanD.replace(/(<([^>]+)>)/gi, "");
        }

        if (req.files["pilihanGambarD"]) {
          const filePath = req.files["pilihanGambarD"][0].path;
          const originalExtension =
            req.files["pilihanGambarD"][0].originalname.split(".")[
              req.files["pilihanGambarD"][0].originalname.split(".").length - 1
            ];
          const fileName =
            req.files["pilihanGambarD"][0].filename + "." + originalExtension;
          const targetPath = path.resolve(
            config.rootPath,
            `public/uploads/pilihan-gambar/${fileName}`
          );

          const src = fs.createReadStream(filePath);
          const dest = fs.createWriteStream(targetPath);

          src.pipe(dest);
          newBankSoal.pilihanGambarD = fileName;
        }
      }

      if (pilihanE === "" && !req.files["pilihanGambarE"]) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban E harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      } else {
        if (pilihanE !== "") {
          newBankSoal.pilihanE.message = pilihanE.replace(/(<([^>]+)>)/gi, "");
        }

        if (req.files["pilihanGambarE"]) {
          const filePath = req.files["pilihanGambarE"][0].path;
          const originalExtension =
            req.files["pilihanGambarE"][0].originalname.split(".")[
              req.files["pilihanGambarE"][0].originalname.split(".").length - 1
            ];
          const fileName =
            req.files["pilihanGambarE"][0].filename + "." + originalExtension;
          const targetPath = path.resolve(
            config.rootPath,
            `public/uploads/pilihan-gambar/${fileName}`
          );

          const src = fs.createReadStream(filePath);
          const dest = fs.createWriteStream(targetPath);

          src.pipe(dest);
          newBankSoal.pilihanGambarE = fileName;
        }
      }

      if (kunciJawaban === "") {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Kunci jawaban ujian harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      } else {
        newBankSoal.kunciJawaban.message = kunciJawaban.replace(
          /(<([^>]+)>)/gi,
          ""
        );
      }

      await newBankSoal.save();

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Soal berhasil ditambahkan!`);
      res.redirect(`/lecturer/bank-soal/${id}`);
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
    }
  },
  destroySoal: async (req, res) => {
    const { id } = req.params;

    try {
      const { valueList } = req.body;

      if (valueList.length === 0) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Maaf, Anda harus memilih satu atau beberapa data untuk dihapus!`
        );
        res.redirect(`/lecturer/bank-soal/${id}`);
      } else {
        const idArray = valueList.split(",");
        let currentImageSoalGambar = "";
        let currentImagePilihanGambar = "";
        const abjads = ["A", "B", "C", "D", "E"];

        const bankSoals = await BankSoal.find({ _id: { $in: idArray } });
        bankSoals.forEach((bankSoal) => {
          if (bankSoal.soalGambar !== "") {
            currentImageSoalGambar = `${config.rootPath}/public/uploads/soal-gambar/${bankSoal.soalGambar}`;
            if (fs.existsSync(currentImageSoalGambar)) {
              fs.unlinkSync(currentImageSoalGambar);
            }
          }

          abjads.forEach((abjad) => {
            if (bankSoal["pilihanGambar" + abjad] !== "") {
              currentImagePilihanGambar = `${
                config.rootPath
              }/public/uploads/pilihan-gambar/${
                bankSoal["pilihanGambar" + abjad]
              }`;
              if (fs.existsSync(currentImagePilihanGambar)) {
                fs.unlinkSync(currentImagePilihanGambar);
              }
            }
          });
        });

        await BankSoal.remove({ _id: { $in: idArray } });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `Soal berhasil dihapus!`);
        res.redirect(`/lecturer/bank-soal/${id}`);
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/bank-soal/${id}`);
    }
  },
};
