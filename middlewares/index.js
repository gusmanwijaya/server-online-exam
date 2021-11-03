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
};
