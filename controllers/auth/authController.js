require("dotenv").config();
require("../../local-storage/index");
const Admin = require("../../models/admin");
const Dosen = require("../../models/dosen");
const config = require("../../config");
const jwt = require("jsonwebtoken");
const { base64decode, base64encode } = require("nodejs-base64");
const crypto = require("crypto");
const jwt_decode = require("jwt-decode");
const randomString = require("randomstring");
const nodemailer = require("nodemailer");

module.exports = {
  signIn: async (req, res) => {
    try {
      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };

      if (req.session.user === null || req.session.user === undefined) {
        res.render("auth/sign-in", {
          alert,
          title: "Sign In",
        });
      } else {
        const payload = jwt_decode(base64decode(req.session.user.token));
        if (payload.data.role === 1) {
          res.redirect("/admin/dashboard");
        } else if (payload.data.role === 0) {
          res.redirect("/dosen/dashboard");
        }
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/sign-in");
    }
  },
  storeSignIn: async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email: email });
      const dosen = await Dosen.findOne({ email: email });

      if (admin) {
        const algorithm = "aes-256-cbc";
        const iv = base64decode(admin.password.iv);
        const key = base64decode(admin.password.key);
        const message = base64decode(admin.password.message);

        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        let dataDecrypted = decipher.update(message, "hex", "utf-8");
        const decrypted = dataDecrypted + decipher.final("utf-8");

        if (decrypted === password) {
          const token = jwt.sign(
            {
              data: {
                _id: admin._id,
                role: admin.role,
              },
            },
            config.jwtKey
          );

          req.session.user = {
            token: base64encode(token),
          };

          if (admin.role === 1) {
            res.redirect("/admin/dashboard");
          }
        } else {
          req.flash("alertStatus", "error");
          req.flash("alertMessage", `Password Anda salah!`);
          res.redirect("/sign-in");
        }
      } else if (dosen) {
        const algorithm = "aes-256-cbc";
        const iv = base64decode(dosen.password.iv);
        const key = base64decode(dosen.password.key);
        const message = base64decode(dosen.password.message);

        const decipher = crypto.createDecipheriv(algorithm, key, iv);

        let dataDecrypted = decipher.update(message, "hex", "utf-8");
        const decrypted = dataDecrypted + decipher.final("utf-8");

        if (decrypted === password) {
          const token = jwt.sign(
            {
              data: {
                _id: dosen._id,
                role: dosen.role,
              },
            },
            config.jwtKey
          );

          req.session.user = {
            token: base64encode(token),
          };

          if (dosen.role === 0) {
            res.redirect("/lecturer/dashboard");
          }
        } else {
          req.flash("alertStatus", "error");
          req.flash("alertMessage", `Password Anda salah!`);
          res.redirect("/sign-in");
        }
      } else {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `${email} tidak terdaftar pada sistem kami!`);
        res.redirect("/sign-in");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/sign-in");
    }
  },
  signOut: async (req, res) => {
    localStorage.clear();
    req.session.destroy();
    res.redirect("/sign-in");
  },
  lupaPassword: async (req, res) => {
    try {
      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };

      if (req.session.user === null || req.session.user === undefined) {
        res.render("auth/lupa-password", {
          alert,
          title: "Lupa Password",
        });
      } else {
        const payload = jwt_decode(base64decode(req.session.user.token));
        if (payload.data.role === 1) {
          res.redirect("/admin/dashboard");
        } else if (payload.data.role === 0) {
          res.redirect("/dosen/dashboard");
        }
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lupa-password");
    }
  },
  storeLupaPassword: async (req, res) => {
    try {
      let dateNow = new Date();
      let minutes = dateNow.getMinutes();

      const { email } = req.body;
      const isAdmin = await Admin.findOne({ email: email });
      const isDosen = await Dosen.findOne({ email: email });

      if (!isAdmin && !isDosen) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `${email} tidak terdaftar di sistem!`);
        res.redirect("/lupa-password");
      } else {
        const kodeOTP = randomString.generate({
          length: 6,
          charset: "numeric",
        });

        const dataLocalStorage = {
          email: isAdmin
            ? `${isAdmin.email}`
            : isDosen
            ? `${isDosen.email}`
            : "",
          role: isAdmin ? 1 : isDosen ? 0 : null,
          OTP: base64encode(kodeOTP),
          expiredOTP: minutes + 2,
        };

        localStorage.setItem("data", JSON.stringify(dataLocalStorage));

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: `${process.env.NODEMAILER_USER}`,
            pass: `${process.env.NODEMAILER_PASS}`,
          },
        });

        const mailOptions = {
          from: `"Ujian Online 🖥️" <noreplay.onlineexams@gmail.com>`,
          to: `${email}`,
          subject: "LUPA PASSWORD - Website Ujian Online",
          text: `Jangan berikan kode OTP kepada siapa pun, kode OTP: ${base64decode(
            dataLocalStorage.OTP
          )}. Kode OTP berlaku selama 2 menit`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            req.flash("alertStatus", "danger");
            req.flash("alertMessage", `${error.message}`);
            res.redirect("/lupa-password");
          }
        });

        res.redirect("/verifikasi-otp");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lupa-password");
    }
  },
  verifikasiOTP: async (req, res) => {
    try {
      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };

      const dataLocalStorage = JSON.parse(localStorage.getItem("data"));

      res.render("auth/verifikasi-otp", {
        alert,
        title: "Verifikasi OTP",
        email: dataLocalStorage.email,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/verifikasi-otp");
    }
  },
  storeVerifikasiOTP: async (req, res) => {
    try {
      let dateNow = new Date();
      let minutes = dateNow.getMinutes();

      var user;
      var dataLocalStorage = JSON.parse(localStorage.getItem("data"));

      if (dataLocalStorage.role === 1) {
        user = await Admin.findOne({ email: dataLocalStorage.email });
      } else if (dataLocalStorage.role === 0) {
        user = await Dosen.findOne({ email: dataLocalStorage.email });
      }

      const { kodeOTP } = req.body;
      const getOTPFromLocalStorage = base64decode(dataLocalStorage.OTP);
      const getExpiredOTPFromLocalStorage = parseInt(
        dataLocalStorage.expiredOTP
      );

      if (kodeOTP !== getOTPFromLocalStorage) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Kode OTP yang Anda masukkan tidak sesuai!`);
        res.redirect("/verifikasi-otp");
      } else {
        if (minutes > getExpiredOTPFromLocalStorage) {
          req.flash("alertStatus", "error");
          req.flash(
            "alertMessage",
            `Kode OTP yang Anda miliki sudah kedaluwarsa. Silahkan kirim ulang email Anda!`
          );
          res.redirect("/lupa-password");
          localStorage.clear();
        } else {
          let algorithm = "aes-256-cbc";
          let iv = base64decode(user.password.iv);
          let key = base64decode(user.password.key);
          let message = base64decode(user.password.message);

          let decipher = crypto.createDecipheriv(algorithm, key, iv);
          let decryptionData = decipher.update(message, "hex", "utf-8");
          let decrypted = decryptionData + decipher.final("utf-8");

          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: `${process.env.NODEMAILER_USER}`,
              pass: `${process.env.NODEMAILER_PASS}`,
            },
          });

          const mailOptions = {
            from: `"Ujian Online 🖥️" <noreplay.onlineexams@gmail.com>`,
            to: `${user.email}`,
            subject: "PASSWORD AKUN ANDA - Website Ujian Online",
            text: `Selamat, password Anda dapat kami temukan, jagalah kerahasiaan password Anda, jangan pernah berikan password ke siapa pun. Password Anda : ${decrypted}`,
          };

          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              req.flash("alertStatus", "danger");
              req.flash("alertMessage", `${error.message}`);
              res.redirect(`/verifikasi-otp`);
            }
          });

          req.flash("alertStatus", "success");
          req.flash(
            "alertMessage",
            `Selamat, kami telah mengirimkan password Anda ke email : ${user.email}`
          );
          res.redirect(`/sign-in`);
          localStorage.clear();
        }
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/verifikasi-otp");
    }
  },
};
