const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");

module.exports = {
  dashboard: async (req, res) => {
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

      res.render("admin/dashboard/index", {
        alert,
        url: originalUrl[2],
        title: "Dashboard",
        payload,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/dashboard");
    }
  },
};
