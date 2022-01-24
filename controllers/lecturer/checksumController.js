const Checksum = require("../../models/checksum");
const config = require("../../config");

const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");
const sha256File = require("sha256-file");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

module.exports = {
  checksum: async (req, res) => {
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

      res.render("lecturer/checksum/index", {
        alert,
        url: originalUrl[2],
        title: "Checksum",
        payload,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/checksum");
    }
  },
  storeChecksum: async (req, res) => {
    try {
      if (req.file) {
        const originalName = req.file.originalname;
        let anyChecksumFileDb = await Checksum.findOne({
          namaFile: originalName,
        });

        if (!anyChecksumFileDb) {
          req.flash("alertStatus", "error");
          req.flash(
            "alertMessage",
            `File yang Anda unggah tidak terdaftar pada sistem kami!`
          );
          res.redirect("/lecturer/checksum");
        } else {
          const tmp_path = req.file.path;
          const target_path = path.resolve(
            config.rootPath,
            `public/uploads/checksum/${originalName}`
          );

          const src = fs.createReadStream(tmp_path);
          const dest = fs.createWriteStream(target_path);

          src.pipe(dest);
          src.on("end", async () => {
            try {
              let algorithm = "aes-256-cbc";
              let iv = base64decode(anyChecksumFileDb.digest.iv);
              let key = base64decode(anyChecksumFileDb.digest.key);
              let message = base64decode(anyChecksumFileDb.digest.message);

              let decipher = crypto.createDecipheriv(algorithm, key, iv);

              let dataDecrypted = decipher.update(message, "hex", "utf-8");
              let decrypted = dataDecrypted + decipher.final("utf-8");

              anyChecksumFileDb.digest.message = decrypted;
              const pathFile = `${config.rootPath}/public/uploads/checksum/${originalName}`;
              const digestFileUnggah = sha256File(pathFile);

              if (fs.existsSync(pathFile)) {
                if (digestFileUnggah === anyChecksumFileDb.digest.message) {
                  req.flash("alertStatus", "success");
                  req.flash(
                    "alertMessage",
                    `File yang Anda unggah asli dan belum pernah terjadi perubahan sedikitpun!`
                  );
                  res.redirect("/lecturer/checksum");
                } else {
                  req.flash("alertStatus", "error");
                  req.flash(
                    "alertMessage",
                    `File yang Anda unggah tidak asli atau sudah mengalami perubahan!`
                  );
                  res.redirect("/lecturer/checksum");
                }

                fs.unlinkSync(pathFile);
              }
            } catch (error) {
              req.flash("alertStatus", "error");
              req.flash("alertMessage", `${error.message}`);
              res.redirect("/lecturer/checksum");
            }
          });
        }
      } else {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Silahkan unggah file terlebih dahulu!`);
        res.redirect("/lecturer/checksum");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/lecturer/checksum");
    }
  },
};
