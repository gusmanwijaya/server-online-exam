const jwt_decode = require("jwt-decode");
const { base64encode, base64decode } = require("nodejs-base64");
const crypto = require("crypto");
const randomString = require("randomstring");
const dateAndTime = require("date-and-time");
const dateNow = new Date();

const Admin = require("../../models/admin");
const Dosen = require("../../models/dosen");
const Mahasiswa = require("../../models/mahasiswa");

module.exports = {
  profile: async (req, res) => {
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

      const currentAdmin = await Admin.findOne({ _id: payload.data._id });

      res.render("admin/profile/index", {
        alert,
        payload,
        currentAdmin,
        url: originalUrl[2],
        title: "Profile",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/profile`);
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { nama } = req.body;

      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));

      await Admin.findOneAndUpdate(
        { _id: payload.data._id },
        {
          nama,
          updatedAt: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
        }
      );

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Nama profile Anda berhasil diubah!`);
      res.redirect(`/admin/profile`);
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/profile`);
    }
  },
  ubahEmail: async (req, res) => {
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

      const currentAdmin = await Admin.findOne({ _id: payload.data._id });

      res.render("admin/profile/ubah-email", {
        alert,
        payload,
        currentAdmin,
        url: originalUrl[2],
        title: "Ubah Email",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/ubah-email`);
    }
  },
  updateEmail: async (req, res) => {
    try {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));
      const { email } = req.body;
      const checkEmailDiDbAdmin = await Admin.findOne({ email: email });
      const checkEmailDiDbDosen = await Dosen.findOne({ email: email });
      const checkEmailDiDbMahasiswa = await Mahasiswa.findOne({ email: email });

      if (
        checkEmailDiDbAdmin ||
        checkEmailDiDbDosen ||
        checkEmailDiDbMahasiswa
      ) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `${email} sudah terdaftar!`);
        res.redirect(`/admin/ubah-email`);
      } else {
        await Admin.findOneAndUpdate(
          { _id: payload.data._id },
          {
            email,
            updatedAt: dateAndTime.format(
              dateNow,
              "dddd, D MMMM YYYY HH:mm:ss"
            ),
          }
        );
        req.flash("alertStatus", "success");
        req.flash("alertMessage", `Alamat email Anda berhasil diubah!`);
        res.redirect(`/admin/profile`);
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/ubah-email`);
    }
  },
  ubahPassword: async (req, res) => {
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

      const currentAdmin = await Admin.findOne({ _id: payload.data._id });

      res.render("admin/profile/ubah-password", {
        alert,
        payload,
        currentAdmin,
        url: originalUrl[2],
        title: "Ubah Password",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/ubah-password`);
    }
  },
  updatePassword: async (req, res) => {
    try {
      const token = req.session.user.token;
      const payload = jwt_decode(base64decode(token));
      const { passwordBaru, ulangiPassword } = req.body;
      const currentAdmin = await Admin.findOne({ _id: payload.data._id });

      let algorithmDecrypt = "aes-256-cbc";
      let ivDecrypt = base64decode(currentAdmin.password.iv);
      let keyDecrypt = base64decode(currentAdmin.password.key);
      let messageDecrypt = base64decode(currentAdmin.password.message);

      let decipher = crypto.createDecipheriv(
        algorithmDecrypt,
        keyDecrypt,
        ivDecrypt
      );

      let dataDecrypted = decipher.update(messageDecrypt, "hex", "utf-8");
      let decryptedPass = dataDecrypted + decipher.final("utf-8");

      if (passwordBaru === decryptedPass) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Password baru yang Anda masukkan sama dengan password Anda sebelumnya!`
        );
        res.redirect(`/admin/ubah-password`);
      } else {
        if (passwordBaru.length < 10) {
          req.flash("alertStatus", "error");
          req.flash(
            "alertMessage",
            `Password harus lebih dari sama dengan (>=) 10 karakter!`
          );
          res.redirect(`/admin/ubah-password`);
        } else {
          if (passwordBaru !== ulangiPassword) {
            req.flash("alertStatus", "error");
            req.flash(
              "alertMessage",
              `Password yang Anda masukkan tidak sama!`
            );
            res.redirect(`/admin/ubah-password`);
          } else {
            var algorithm = "aes-256-cbc";
            var iv = randomString.generate(16);
            var key =
              Math.floor(dateNow.getTime() / 1000).toString() +
              randomString.generate(22);
            var message = passwordBaru;

            var cipher = crypto.createCipheriv(algorithm, key, iv);
            var encrypPass = cipher.update(message, "utf-8", "hex");
            encrypPass += cipher.final("hex");

            await Admin.findOneAndUpdate(
              { _id: payload.data._id },
              {
                password: {
                  iv: base64encode(iv),
                  key: base64encode(key),
                  message: base64encode(encrypPass),
                },
                updatedAt: dateAndTime.format(
                  dateNow,
                  "dddd, D MMMM YYYY HH:mm:ss"
                ),
              }
            );

            req.flash("alertStatus", "success");
            req.flash("alertMessage", `Password Anda berhasil diubah!`);
            res.redirect(`/admin/profile`);
          }
        }
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/ubah-password`);
    }
  },
};
