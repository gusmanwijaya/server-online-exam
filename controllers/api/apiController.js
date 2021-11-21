const Mahasiswa = require("../../models/mahasiswa");

const path = require("path");
const fs = require("fs");
const config = require("../../config");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { base64decode } = require("nodejs-base64");

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
  actionHasilUjian: async (req, res) => {
    try {
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  },
};
