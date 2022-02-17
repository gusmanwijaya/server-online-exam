const Mahasiswa = require("../../models/mahasiswa");
const JadwalUjian = require("../../models/jadwal-ujian");
const HasilUjian = require("../../models/hasil-ujian");
const BankSoal = require("../../models/bank-soal");

const config = require("../../config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { base64encode, base64decode } = require("nodejs-base64");
const dateAndTime = require("date-and-time");
const sha256File = require("sha256-file");

module.exports = {
  getPengujianAlgoritmaAES256CBCandBase64: async (req, res) => {
    try {
      const { plaintext, iv, key } = req.body;
      const algorithm = "aes-256-cbc";

      if (plaintext === "") {
        res.status(400).json({
          status: "error",
          message: "Plaintext harus diisi!",
        });
      } else if (iv === "") {
        res.status(400).json({
          status: "error",
          message: "IV harus diisi!",
        });
      } else if (key === "") {
        res.status(400).json({
          status: "error",
          message: "Key harus diisi!",
        });
      } else {
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypt = cipher.update(plaintext, "utf-8", "hex");
        encrypt += cipher.final("hex");

        res.status(200).json({
          status: "success",
          data: {
            plaintext,
            iv,
            key,
            ciphertext: encrypt,
            ciphertextBase64: base64encode(encrypt),
          },
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
  getPengujianAlgoritmaSHA256: async (req, res) => {
    try {
      if (req.file) {
        res.status(200).json({
          status: "success",
          data: {
            filename: `${req.file.originalname}`,
            locationFile: `${req.file.path}`,
            checksum: sha256File(`${req.file.path}`),
          },
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "Silahkan masukkan file!",
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
  signIn: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      await Mahasiswa.findOne({ email: email })
        .populate("mataKuliah")
        .populate("programStudi")
        .then((mahasiswa) => {
          if (mahasiswa) {
            const algorithm = "aes-256-cbc";
            const iv = base64decode(mahasiswa.password.iv);
            const key = base64decode(mahasiswa.password.key);
            const message = base64decode(mahasiswa.password.message);

            const decipher = crypto.createDecipheriv(algorithm, key, iv);

            let dataDecrypted = decipher.update(message, "hex", "utf-8");
            const decrypted = dataDecrypted + decipher.final("utf-8");

            if (decrypted === password) {
              const token = jwt.sign(
                {
                  mahasiswa: {
                    _id: mahasiswa._id,
                    nama: mahasiswa.nama,
                    npm: mahasiswa.npm,
                    email: mahasiswa.email,
                    jenisKelamin: mahasiswa.jenisKelamin,
                    programStudi: mahasiswa.programStudi.nama,
                    role: mahasiswa.role,
                  },
                },
                config.jwtKey
              );

              res.status(200).json({
                status: "success",
                data: { token },
              });
            } else {
              res.status(400).json({
                status: "error",
                message: "Kata sandi Anda salah!",
              });
            }
          } else {
            res.status(404).json({
              status: "error",
              message: "Email tidak terdaftar pada sistem kami!",
            });
          }
        });
    } catch (error) {
      if (error && error.name === "ValidationError") {
        return res.status(422).json({
          status: "error",
          message: error.message,
        });
      }
      next(error);
    }
  },
  getJadwalUjian: async (req, res) => {
    try {
      const jadwalUjian = await JadwalUjian.find({
        mataKuliah: { $in: req.mahasiswa.mataKuliah },
      })
        .populate("dosen", "_id nama nip email jenisKelamin", "Dosen")
        .populate("mataKuliah", "_id nama", "MataKuliah");

      jadwalUjian.forEach((ujian) => {
        delete ujian._doc.createdAt;
        delete ujian._doc.__v;
      });

      res.status(200).json({
        status: "success",
        data: jadwalUjian,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message ?? "Mohon maaf, terjadi kesalahan pada server!",
      });
    }
  },
  getDetailJadwalUjian: async (req, res) => {
    try {
      const { idUjian } = req.params;

      const jadwalUjian = await JadwalUjian.findOne({ _id: idUjian })
        .populate("dosen", "_id nama nip email jenisKelamin", "Dosen")
        .populate("mataKuliah", "_id nama", "MataKuliah");

      delete jadwalUjian._doc.createdAt;
      delete jadwalUjian._doc.__v;

      res.status(200).json({
        status: "success",
        data: jadwalUjian,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message ?? "Mohon maaf, terjadi kesalahan pada server!",
      });
    }
  },
  getTokenUjian: async (req, res) => {
    try {
      const { idUjian } = req.params;

      const data = await JadwalUjian.findOne({ _id: idUjian }).select(
        "token mulaiUjian terlambatUjian"
      );

      let dateNow = new Date();
      const terlambatUjian = dateAndTime.parse(
        data.terlambatUjian,
        "DD-MM-YYYY HH:mm"
      );
      const mulaiUjian = dateAndTime.parse(data.mulaiUjian, "DD-MM-YYYY HH:mm");

      if (dateNow < mulaiUjian) {
        res.status(403).json({
          status: "error",
          message: "Ujian belum mulai, mohon tunggu dan bersabar!",
        });
      } else {
        if (dateNow > terlambatUjian) {
          res.status(403).json({
            status: "error",
            message: "Maaf, Anda terlambat dan tidak bisa mengikuti ujian!",
          });
        } else {
          res.status(200).json({
            status: "success",
            data,
          });
        }
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message ?? "Mohon maaf, terjadi kesalahan pada server!",
      });
    }
  },
  getSoalUjian: async (req, res) => {
    try {
      const { idUjian } = req.params;

      const jadwalUjian = await JadwalUjian.findOne({
        _id: idUjian,
      });

      BankSoal.findRandom(
        {
          mataKuliah: jadwalUjian.mataKuliah._id,
        },
        {
          dosen: 1,
          mataKuliah: 1,
          bobot: 1,
          soalGambar: 1,
          soal: 1,
          pilihanA: 1,
          pilihanB: 1,
          pilihanC: 1,
          pilihanD: 1,
          pilihanE: 1,
          pilihanGambarA: 1,
          pilihanGambarB: 1,
          pilihanGambarC: 1,
          pilihanGambarD: 1,
          pilihanGambarE: 1,
          kunciJawaban: 1,
        },
        {
          skip: jadwalUjian.jumlahSoal,
          limit: jadwalUjian.jumlahSoal,
          populate: [
            {
              path: "dosen",
              select: "_id nama nip email jenisKelamin",
            },
            {
              path: "mataKuliah",
              select: "_id nama",
            },
          ],
        },
        function (err, results) {
          if (!err) {
            const abjads = ["A", "B", "C", "D", "E"];
            let algorithm = "aes-256-cbc";

            results.forEach((soalUjian) => {
              if (soalUjian.soal.message !== "") {
                let ivSoal = base64decode(soalUjian.soal.iv);
                let keySoal = base64decode(soalUjian.soal.key);
                let messageSoal = base64decode(soalUjian.soal.message);

                let decipherSoal = crypto.createDecipheriv(
                  algorithm,
                  keySoal,
                  ivSoal
                );
                let dataDecryptedSoal = decipherSoal.update(
                  messageSoal,
                  "hex",
                  "utf-8"
                );
                let decryptedSoal =
                  dataDecryptedSoal + decipherSoal.final("utf-8");

                soalUjian.soal.message = decryptedSoal.replace(`\r\n`, "");
              }

              if (soalUjian.soalGambar.message !== "") {
                let ivSoalGambar = base64decode(soalUjian.soalGambar.iv);
                let keySoalGambar = base64decode(soalUjian.soalGambar.key);
                let messageSoalGambar = base64decode(
                  soalUjian.soalGambar.message
                );

                let decipherSoalGambar = crypto.createDecipheriv(
                  algorithm,
                  keySoalGambar,
                  ivSoalGambar
                );
                let dataDecryptedSoalGambar = decipherSoalGambar.update(
                  messageSoalGambar,
                  "hex",
                  "utf-8"
                );
                let decryptedSoalGambar =
                  dataDecryptedSoalGambar + decipherSoalGambar.final("utf-8");

                soalUjian.soalGambar.message = decryptedSoalGambar.replace(
                  `\r\n`,
                  ""
                );
              }

              abjads.forEach((abjad) => {
                if (soalUjian["pilihan" + abjad].message !== "") {
                  let ivPilihan = base64decode(soalUjian["pilihan" + abjad].iv);
                  let keyPilihan = base64decode(
                    soalUjian["pilihan" + abjad].key
                  );
                  let messagePilihan = base64decode(
                    soalUjian["pilihan" + abjad].message
                  );

                  let decipherPilihan = crypto.createDecipheriv(
                    algorithm,
                    keyPilihan,
                    ivPilihan
                  );
                  let dataDecryptedPilihan = decipherPilihan.update(
                    messagePilihan,
                    "hex",
                    "utf-8"
                  );
                  let decryptedPilihan =
                    dataDecryptedPilihan + decipherPilihan.final("utf-8");

                  soalUjian["pilihan" + abjad].message =
                    decryptedPilihan.replace(`\r\n`, "");
                }

                if (soalUjian["pilihanGambar" + abjad].message !== "") {
                  let ivPilihanGambar = base64decode(
                    soalUjian["pilihanGambar" + abjad].iv
                  );
                  let keyPilihanGambar = base64decode(
                    soalUjian["pilihanGambar" + abjad].key
                  );
                  let messagePilihanGambar = base64decode(
                    soalUjian["pilihanGambar" + abjad].message
                  );

                  let decipherPilihanGambar = crypto.createDecipheriv(
                    algorithm,
                    keyPilihanGambar,
                    ivPilihanGambar
                  );
                  let dataDecryptedPilihanGambar = decipherPilihanGambar.update(
                    messagePilihanGambar,
                    "hex",
                    "utf-8"
                  );
                  let decryptedPilihanGambar =
                    dataDecryptedPilihanGambar +
                    decipherPilihanGambar.final("utf-8");

                  soalUjian["pilihanGambar" + abjad].message =
                    decryptedPilihanGambar.replace(`\r\n`, "");
                }
              });

              if (soalUjian.kunciJawaban.message !== "") {
                let ivKunciJawaban = base64decode(soalUjian.kunciJawaban.iv);
                let keyKunciJawaban = base64decode(soalUjian.kunciJawaban.key);
                let messageKunciJawaban = base64decode(
                  soalUjian.kunciJawaban.message
                );

                let decipherKunciJawaban = crypto.createDecipheriv(
                  algorithm,
                  keyKunciJawaban,
                  ivKunciJawaban
                );
                let dataDecryptedKunciJawaban = decipherKunciJawaban.update(
                  messageKunciJawaban,
                  "hex",
                  "utf-8"
                );
                let decryptedKunciJawaban =
                  dataDecryptedKunciJawaban +
                  decipherKunciJawaban.final("utf-8");

                soalUjian.kunciJawaban.message = decryptedKunciJawaban;
              }

              delete soalUjian.soalGambar._doc._id;
              delete soalUjian.soalGambar._doc.iv;
              delete soalUjian.soalGambar._doc.key;

              delete soalUjian.soal._doc._id;
              delete soalUjian.soal._doc.iv;
              delete soalUjian.soal._doc.key;

              abjads.forEach((abjad) => {
                delete soalUjian["pilihan" + abjad]._doc._id;
                delete soalUjian["pilihan" + abjad]._doc.iv;
                delete soalUjian["pilihan" + abjad]._doc.key;

                delete soalUjian["pilihanGambar" + abjad]._doc._id;
                delete soalUjian["pilihanGambar" + abjad]._doc.iv;
                delete soalUjian["pilihanGambar" + abjad]._doc.key;
              });

              delete soalUjian.kunciJawaban._doc._id;
              delete soalUjian.kunciJawaban._doc.iv;
              delete soalUjian.kunciJawaban._doc.key;
            });

            res.status(200).json({
              status: "success",
              data: results,
            });
          } else {
            res.status(500).json({
              status: "error",
              message: err,
            });
          }
        }
      );
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message ?? "Mohon maaf, terjadi kesalahan pada server!",
      });
    }
  },
  getOneSoalUjian: async (req, res) => {
    try {
      const { q } = req.query;

      if (q === "") {
        res.status(400).json({
          status: "error",
          message: "Anda tidak memasukkan query params!",
        });
      } else {
        const soalUjian = await BankSoal.findOne({ _id: q })
          .populate("dosen", "_id nama nip email jenisKelamin", "Dosen")
          .populate("mataKuliah", "_id nama", "MataKuliah");

        const abjads = ["A", "B", "C", "D", "E"];
        let algorithm = "aes-256-cbc";

        if (soalUjian.soal.message !== "") {
          let ivSoal = base64decode(soalUjian.soal.iv);
          let keySoal = base64decode(soalUjian.soal.key);
          let messageSoal = base64decode(soalUjian.soal.message);

          let decipherSoal = crypto.createDecipheriv(
            algorithm,
            keySoal,
            ivSoal
          );
          let dataDecryptedSoal = decipherSoal.update(
            messageSoal,
            "hex",
            "utf-8"
          );
          let decryptedSoal = dataDecryptedSoal + decipherSoal.final("utf-8");

          soalUjian.soal.message = decryptedSoal.replace(`\r\n`, "");
        }

        if (soalUjian.soalGambar.message !== "") {
          let ivSoalGambar = base64decode(soalUjian.soalGambar.iv);
          let keySoalGambar = base64decode(soalUjian.soalGambar.key);
          let messageSoalGambar = base64decode(soalUjian.soalGambar.message);

          let decipherSoalGambar = crypto.createDecipheriv(
            algorithm,
            keySoalGambar,
            ivSoalGambar
          );
          let dataDecryptedSoalGambar = decipherSoalGambar.update(
            messageSoalGambar,
            "hex",
            "utf-8"
          );
          let decryptedSoalGambar =
            dataDecryptedSoalGambar + decipherSoalGambar.final("utf-8");

          soalUjian.soalGambar.message = decryptedSoalGambar.replace(
            `\r\n`,
            ""
          );
        }

        abjads.forEach((abjad) => {
          if (soalUjian["pilihan" + abjad].message !== "") {
            let ivPilihan = base64decode(soalUjian["pilihan" + abjad].iv);
            let keyPilihan = base64decode(soalUjian["pilihan" + abjad].key);
            let messagePilihan = base64decode(
              soalUjian["pilihan" + abjad].message
            );

            let decipherPilihan = crypto.createDecipheriv(
              algorithm,
              keyPilihan,
              ivPilihan
            );
            let dataDecryptedPilihan = decipherPilihan.update(
              messagePilihan,
              "hex",
              "utf-8"
            );
            let decryptedPilihan =
              dataDecryptedPilihan + decipherPilihan.final("utf-8");

            soalUjian["pilihan" + abjad].message = decryptedPilihan.replace(
              `\r\n`,
              ""
            );
          }

          if (soalUjian["pilihanGambar" + abjad].message !== "") {
            let ivPilihanGambar = base64decode(
              soalUjian["pilihanGambar" + abjad].iv
            );
            let keyPilihanGambar = base64decode(
              soalUjian["pilihanGambar" + abjad].key
            );
            let messagePilihanGambar = base64decode(
              soalUjian["pilihanGambar" + abjad].message
            );

            let decipherPilihanGambar = crypto.createDecipheriv(
              algorithm,
              keyPilihanGambar,
              ivPilihanGambar
            );
            let dataDecryptedPilihanGambar = decipherPilihanGambar.update(
              messagePilihanGambar,
              "hex",
              "utf-8"
            );
            let decryptedPilihanGambar =
              dataDecryptedPilihanGambar + decipherPilihanGambar.final("utf-8");

            soalUjian["pilihanGambar" + abjad].message =
              decryptedPilihanGambar.replace(`\r\n`, "");
          }
        });

        if (soalUjian.kunciJawaban.message !== "") {
          let ivKunciJawaban = base64decode(soalUjian.kunciJawaban.iv);
          let keyKunciJawaban = base64decode(soalUjian.kunciJawaban.key);
          let messageKunciJawaban = base64decode(
            soalUjian.kunciJawaban.message
          );

          let decipherKunciJawaban = crypto.createDecipheriv(
            algorithm,
            keyKunciJawaban,
            ivKunciJawaban
          );
          let dataDecryptedKunciJawaban = decipherKunciJawaban.update(
            messageKunciJawaban,
            "hex",
            "utf-8"
          );
          let decryptedKunciJawaban =
            dataDecryptedKunciJawaban + decipherKunciJawaban.final("utf-8");

          soalUjian.kunciJawaban.message = decryptedKunciJawaban;
        }

        delete soalUjian.soalGambar._doc._id;
        delete soalUjian.soalGambar._doc.iv;
        delete soalUjian.soalGambar._doc.key;

        delete soalUjian.soal._doc._id;
        delete soalUjian.soal._doc.iv;
        delete soalUjian.soal._doc.key;

        abjads.forEach((abjad) => {
          delete soalUjian["pilihan" + abjad]._doc._id;
          delete soalUjian["pilihan" + abjad]._doc.iv;
          delete soalUjian["pilihan" + abjad]._doc.key;

          delete soalUjian["pilihanGambar" + abjad]._doc._id;
          delete soalUjian["pilihanGambar" + abjad]._doc.iv;
          delete soalUjian["pilihanGambar" + abjad]._doc.key;
        });

        delete soalUjian.kunciJawaban._doc._id;
        delete soalUjian.kunciJawaban._doc.iv;
        delete soalUjian.kunciJawaban._doc.key;

        delete soalUjian._doc.createdAt;
        delete soalUjian._doc.updatedAt;
        delete soalUjian._doc.__v;

        res.status(200).json({
          status: "success",
          data: soalUjian,
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message ?? "Mohon maaf, terjadi kesalahan pada server!",
      });
    }
  },
  getKunciJawaban: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q) {
        res.status(400).json({
          status: "error",
          message: "Anda tidak memasukkan query params!",
        });
      } else {
        const jawabanUjian = await BankSoal.find({
          _id: { $in: q },
        }).select("_id kunciJawaban");

        let algorithm = "aes-256-cbc";

        jawabanUjian.forEach((jwbUjian) => {
          if (jwbUjian.kunciJawaban.message !== "") {
            let ivKunciJawaban = base64decode(jwbUjian.kunciJawaban.iv);
            let keyKunciJawaban = base64decode(jwbUjian.kunciJawaban.key);
            let messageKunciJawaban = base64decode(
              jwbUjian.kunciJawaban.message
            );

            let decipherKunciJawaban = crypto.createDecipheriv(
              algorithm,
              keyKunciJawaban,
              ivKunciJawaban
            );
            let dataDecryptedKunciJawaban = decipherKunciJawaban.update(
              messageKunciJawaban,
              "hex",
              "utf-8"
            );
            let decryptedKunciJawaban =
              dataDecryptedKunciJawaban + decipherKunciJawaban.final("utf-8");

            jwbUjian.kunciJawaban.message = decryptedKunciJawaban;
          }

          delete jwbUjian.kunciJawaban._doc._id;
          delete jwbUjian.kunciJawaban._doc.iv;
          delete jwbUjian.kunciJawaban._doc.key;
        });

        res.status(200).json({
          status: "success",
          data: jawabanUjian,
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message ?? "Mohon maaf, terjadi kesalahan pada server!",
      });
    }
  },
  postHasilUjian: async (req, res) => {
    try {
      const { jadwalUjian, listJawaban, jumlahBenar, nilai, masuk, selesai } =
        req.body;

      const data = await HasilUjian.create({
        jadwalUjian,
        mahasiswa: req.mahasiswa._id,
        listJawaban,
        jumlahBenar,
        nilai,
        masuk,
        selesai,
      });

      res.status(200).json({
        status: "success",
        data,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message ?? "Mohon maaf, terjadi kesalahan pada server!",
      });
    }
  },
  getHasilUjian: async (req, res) => {
    try {
      const { idMahasiswa } = req.query;

      if (!idMahasiswa) {
        res.status(400).json({
          status: "error",
          message: "Anda tidak memasukkan query params untuk id mahasiswa!",
        });
      } else {
        let hasilUjian = await HasilUjian.findOne({
          mahasiswa: idMahasiswa,
        })
          .populate("jadwalUjian", "_id namaUjian", "JadwalUjian")
          .populate("mahasiswa", "_id nama npm", "Mahasiswa");

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

        delete hasilUjian.listJawaban._doc._id;
        delete hasilUjian.listJawaban._doc.iv;
        delete hasilUjian.listJawaban._doc.key;

        delete hasilUjian.jumlahBenar._doc._id;
        delete hasilUjian.jumlahBenar._doc.iv;
        delete hasilUjian.jumlahBenar._doc.key;

        delete hasilUjian.nilai._doc._id;
        delete hasilUjian.nilai._doc.iv;
        delete hasilUjian.nilai._doc.key;

        delete hasilUjian._doc.__v;

        res.status(200).json({
          status: "success",
          data: hasilUjian,
        });
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message ?? "Mohon maaf, terjadi kesalahan pada server!",
      });
    }
  },
};
