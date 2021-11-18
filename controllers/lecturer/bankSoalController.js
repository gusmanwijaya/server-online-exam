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
      const abjads = ["A", "B", "C", "D", "E"];

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

      let newBankSoal = {
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
      };

      if (Object.keys(req.files).length === 0) {
        await BankSoal.create(newBankSoal);
      } else {
        for (const abjad of abjads) {
          if (
            req.files["soalGambar"] !== undefined &&
            req.files[`pilihanGambar${abjad}`] !== undefined
          ) {
            const filePathSoalGambar = req.files["soalGambar"][0].path;
            const originalExtensionSoalGambar =
              req.files["soalGambar"][0].originalname.split(".")[
                req.files["soalGambar"][0].originalname.split(".").length - 1
              ];
            const fileNameSoalGambar =
              req.files["soalGambar"][0].filename +
              "." +
              originalExtensionSoalGambar;
            const targetPathSoalGambar = path.resolve(
              config.rootPath,
              `public/uploads/soal-gambar/${fileNameSoalGambar}`
            );

            const srcSoalGambar = fs.createReadStream(filePathSoalGambar);
            const destSoalGambar = fs.createWriteStream(targetPathSoalGambar);

            srcSoalGambar.pipe(destSoalGambar);

            const filePathPilihanGambar =
              req.files[`pilihanGambar${abjad}`][0].path;
            const originalExtensionPilihanGambar =
              req.files[`pilihanGambar${abjad}`][0].originalname.split(".")[
                req.files[`pilihanGambar${abjad}`][0].originalname.split(".")
                  .length - 1
              ];
            const fileNamePilihanGambar =
              req.files[`pilihanGambar${abjad}`][0].filename +
              "." +
              originalExtensionPilihanGambar;
            const targetPathPilihanGambar = path.resolve(
              config.rootPath,
              `public/uploads/pilihan-gambar/${fileNamePilihanGambar}`
            );

            const srcPilihanGambar = fs.createReadStream(filePathPilihanGambar);
            const destPilihanGambar = fs.createWriteStream(
              targetPathPilihanGambar
            );

            srcPilihanGambar.pipe(destPilihanGambar);

            srcPilihanGambar.on("end", async () => {
              try {
                newBankSoal["soalGambar"] = fileNameSoalGambar;
                let key = `pilihanGambar${abjad}`;
                newBankSoal[key] = fileNamePilihanGambar;
                if (abjad === "E") {
                  await BankSoal.create(newBankSoal);
                }
              } catch (error) {
                req.flash("alertStatus", "error");
                req.flash("alertMessage", `${error.message}`);
                res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
              }
            });
          } else {
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
                  if (abjad === "E") {
                    newBankSoal["soalGambar"] = fileName;
                    await BankSoal.create(newBankSoal);
                  }
                } catch (error) {
                  req.flash("alertStatus", "error");
                  req.flash("alertMessage", `${error.message}`);
                  res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
                }
              });
            } else {
              if (req.files[`pilihanGambar${abjad}`] !== undefined) {
                const filePath = req.files[`pilihanGambar${abjad}`][0].path;
                const originalExtension =
                  req.files[`pilihanGambar${abjad}`][0].originalname.split(".")[
                    req.files[`pilihanGambar${abjad}`][0].originalname.split(
                      "."
                    ).length - 1
                  ];
                const fileName =
                  req.files[`pilihanGambar${abjad}`][0].filename +
                  "." +
                  originalExtension;
                const targetPath = path.resolve(
                  config.rootPath,
                  `public/uploads/pilihan-gambar/${fileName}`
                );

                const src = fs.createReadStream(filePath);
                const dest = fs.createWriteStream(targetPath);

                src.pipe(dest);

                src.on("end", async () => {
                  try {
                    let key = `pilihanGambar${abjad}`;
                    newBankSoal[key] = fileName;
                    if (abjad === "E") {
                      await BankSoal.create(newBankSoal);
                    }
                  } catch (error) {
                    req.flash("alertStatus", "error");
                    req.flash("alertMessage", `${error.message}`);
                    res.redirect(`/lecturer/bank-soal/${id}/create-soal`);
                  }
                });
              }
            }
          }
        }
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
