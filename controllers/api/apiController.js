const Mahasiswa = require("../../models/mahasiswa");
const JadwalUjian = require("../../models/jadwal-ujian");
const HasilUjian = require("../../models/hasil-ujian");
const BankSoal = require("../../models/bank-soal");
const MataKuliah = require("../../models/mata-kuliah");

const path = require("path");
const fs = require("fs");
const config = require("../../config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { base64decode } = require("nodejs-base64");
const dateAndTime = require("date-and-time");

module.exports = {
  signIn: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      await Mahasiswa.findOne({ email: email })
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
                message: "Password Anda salah!",
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
      const matkulMahasiswa = await MataKuliah.find({
        programStudi: req.mahasiswa.programStudi._id,
      });

      const jadwalUjian = await JadwalUjian.find({
        mataKuliah: { $in: matkulMahasiswa },
      })
        .populate("dosen", "_id nama nip email jenisKelamin", "Dosen")
        .populate("mataKuliah", "_id nama", "MataKuliah");

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
  getSoalUjian: async (req, res) => {
    try {
      const { id } = req.params;
      const { token } = req.body;

      const jadwalUjian = await JadwalUjian.findOne({
        _id: id,
      });

      if (!jadwalUjian) {
        res.status(404).json({
          status: "error",
          message: "Jadwal ujian tidak ditemukan!",
        });
      } else {
        if (jadwalUjian.token === token) {
          const soalUjian = await BankSoal.find({
            mataKuliah: jadwalUjian.mataKuliah._id,
          })
            .populate("dosen", "_id nama nip email jenisKelamin", "Dosen")
            .populate("mataKuliah", "_id nama", "MataKuliah");

          res.status(200).json({
            status: "success",
            data: soalUjian,
          });
        } else {
          res.status(400).json({
            status: "error",
            message: "Token yang Anda miliki tidak sesuai!",
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
};
