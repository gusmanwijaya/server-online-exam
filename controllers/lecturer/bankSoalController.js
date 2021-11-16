require("../../local-storage/index");

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

      const mataKuliah = await MataKuliah.findOne({ _id: id });

      res.render("lecturer/bank-soal/soal/create", {
        alert,
        url: originalUrl[2],
        title: "Tambah Soal",
        payload,
        mataKuliah,
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

      if (soal === "" || soal === null) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Soal ujian harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      }

      if (pilihanA === "" || pilihanA === null) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban A harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      }

      if (pilihanB === "" || pilihanB === null) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban B harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      }

      if (pilihanC === "" || pilihanC === null) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban C harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      }

      if (pilihanD === "" || pilihanD === null) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban D harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      }

      if (pilihanE === "" || pilihanE === null) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Pilihan jawaban E harus diisi!`);
        res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
      }

      let bankSoal = await BankSoal.create({
        dosen: payload.data._id,
        mataKuliah: id,
        bobot,
        soal: {
          message: soal.replace(/(<([^>]+)>)/gi, ""),
        },
        pilihanA: {
          message: pilihanA.replace(/(<([^>]+)>)/gi, ""),
        },
        pilihanB: {
          message: pilihanB.replace(/(<([^>]+)>)/gi, ""),
        },
        pilihanC: {
          message: pilihanC.replace(/(<([^>]+)>)/gi, ""),
        },
        pilihanD: {
          message: pilihanD.replace(/(<([^>]+)>)/gi, ""),
        },
        pilihanE: {
          message: pilihanE.replace(/(<([^>]+)>)/gi, ""),
        },
        kunciJawaban: {
          message: kunciJawaban,
        },
      });

      if (req.files["soalGambar"] !== undefined) {
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

        src.on("end", async () => {
          try {
            bankSoal.soalGambar.push(fileName);
            await bankSoal.save();
          } catch (error) {
            req.flash("alertStatus", "error");
            req.flash("alertMessage", `${error.message}`);
            res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
          }
        });
      }

      if (req.files["pilihanGambarA"] !== undefined) {
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

        src.on("end", async () => {
          try {
            bankSoal.pilihanGambarA.push(fileName);
            await bankSoal.save();
          } catch (error) {
            req.flash("alertStatus", "error");
            req.flash("alertMessage", `${error.message}`);
            res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
          }
        });
      }

      if (req.files["pilihanGambarB"] !== undefined) {
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

        src.on("end", async () => {
          try {
            bankSoal.pilihanGambarB.push(fileName);
            await bankSoal.save();
          } catch (error) {
            req.flash("alertStatus", "error");
            req.flash("alertMessage", `${error.message}`);
            res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
          }
        });
      }

      if (req.files["pilihanGambarC"] !== undefined) {
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

        src.on("end", async () => {
          try {
            bankSoal.pilihanGambarC.push(fileName);
            await bankSoal.save();
          } catch (error) {
            req.flash("alertStatus", "error");
            req.flash("alertMessage", `${error.message}`);
            res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
          }
        });
      }

      if (req.files["pilihanGambarD"] !== undefined) {
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

        src.on("end", async () => {
          try {
            bankSoal.pilihanGambarD.push(fileName);
            await bankSoal.save();
          } catch (error) {
            req.flash("alertStatus", "error");
            req.flash("alertMessage", `${error.message}`);
            res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
          }
        });
      }

      if (req.files["pilihanGambarE"] !== undefined) {
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

        src.on("end", async () => {
          try {
            bankSoal.pilihanGambarE.push(fileName);
            await bankSoal.save();
          } catch (error) {
            req.flash("alertStatus", "error");
            req.flash("alertMessage", `${error.message}`);
            res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
          }
        });
      }

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Soal berhasil ditambahkan!`);
      res.redirect(`/lecturer/bank-soal/${id}`);
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
    }
  },
};
