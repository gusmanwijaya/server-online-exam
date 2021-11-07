require("../local-storage/index");

module.exports = {
  isLogin: async (req, res, next) => {
    if (req.session.user === null || req.session.user === undefined) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", "Mohon maaf, silahkan lakukan login dahulu!");
      res.redirect("/sign-in");
    } else {
      next();
    }
  },
  isNotSendEmailOTP: async (req, res, next) => {
    const isAnyDataLocalStorage = localStorage.getItem("data");
    if (!isAnyDataLocalStorage) {
      req.flash("alertStatus", "error");
      req.flash(
        "alertMessage",
        "Mohon maaf, Anda tidak memiliki hak untuk mengakses!"
      );
      res.redirect("/sign-in");
    } else {
      next();
    }
  },
};
