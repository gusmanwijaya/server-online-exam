const Admin = require("../../models/admin");
const config = require("../../config");
const jwt = require("jsonwebtoken");
const { base64decode, base64encode } = require("nodejs-base64");
const crypto = require("crypto");
const jwt_decode = require("jwt-decode");

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
        res.render("auth/admin/sign-in", {
          alert,
          title: "Sign In",
        });
      } else {
        const payload = jwt_decode(base64decode(req.session.user.token));
        console.log("payload : ", payload);
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
  storeAdminSignIn: async (req, res) => {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ email: email });

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
    req.session.destroy();
    res.redirect("/sign-in");
  },
};
