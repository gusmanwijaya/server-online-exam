const ProgramStudi = require("../../models/program-studi");

const dateAndTime = require("date-and-time");
const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");

module.exports = {
  programStudi: async (req, res) => {
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

      const programStudies = await ProgramStudi.find().sort({ nama: "asc" });

      res.render("admin/program-studi/index", {
        alert,
        programStudies,
        url: originalUrl[2],
        title: "Program Studi",
        payload,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/program-studi");
    }
  },
  storeProgramStudi: async (req, res) => {
    try {
      const { nama } = req.body;

      await ProgramStudi.create({ nama });

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Program studi ${nama} berhasil ditambahkan!`);
      res.redirect("/admin/program-studi");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/program-studi");
    }
  },
  updateProgramStudi: async (req, res) => {
    try {
      let dateNow = new Date();

      const { id, nama } = req.body;

      const checkProdiAtDb = await ProgramStudi.findOne({ nama: nama });
      if (checkProdiAtDb) {
        req.flash("alertStatus", "error");
        req.flash("alertMessage", `Program studi ${nama} sudah terdaftar!`);
        res.redirect("/admin/program-studi");
      } else {
        await ProgramStudi.findOneAndUpdate(
          { _id: id },
          {
            nama,
            updatedAt: dateAndTime.format(
              dateNow,
              "dddd, D MMMM YYYY HH:mm:ss"
            ),
          }
        );

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `Program studi berhasil diubah!`);
        res.redirect("/admin/program-studi");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/program-studi");
    }
  },
  destroyProgramStudi: async (req, res) => {
    try {
      const { valueList } = req.body;

      if (valueList.length === 0) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Maaf, Anda harus memilih satu atau beberapa data untuk dihapus!`
        );
        res.redirect("/admin/program-studi");
      } else {
        const idArray = valueList.split(",");
        await ProgramStudi.remove({ _id: { $in: idArray } });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `Program studi berhasil dihapus!`);
        res.redirect("/admin/program-studi");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/program-studi");
    }
  },
};
