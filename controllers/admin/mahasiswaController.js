const Mahasiswa = require("../../models/mahasiswa");
const ProgramStudi = require("../../models/program-studi");

const dateAndTime = require("date-and-time");
const dateNow = new Date();

module.exports = {
  mahasiswa: async (req, res) => {
    try {
      const originalUrl = req.originalUrl.split("/");

      const alertStatus = req.flash("alertStatus");
      const alertMessage = req.flash("alertMessage");

      const alert = {
        status: alertStatus,
        message: alertMessage,
      };

      const mahasiswas = await Mahasiswa.find()
        .populate("programStudi", "_id nama", "ProgramStudi")
        .sort({ npm: "asc" });
      const programStudies = await ProgramStudi.find().sort({ nama: "asc" });

      res.render("admin/mahasiswa/index", {
        alert,
        mahasiswas,
        programStudies,
        url: originalUrl[2],
        title: "Mahasiswa",
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mahasiswa");
    }
  },
  storeMahasiswa: async (req, res) => {
    try {
      const { nama, npm, email, password, jenisKelamin, programStudi } =
        req.body;

      if (password.length < 10) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Password harus lebih dari sama dengan (>=) 10 karakter!`
        );
        res.redirect("/admin/mahasiswa");
      } else {
        await Mahasiswa.create({
          nama,
          npm,
          email,
          password: {
            message: password,
          },
          jenisKelamin,
          programStudi,
        });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `${nama} (${npm}) berhasil ditambahkan!`);
        res.redirect("/admin/mahasiswa");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mahasiswa");
    }
  },
  updateMahasiswa: async (req, res) => {
    try {
      const { id, jenisKelamin } = req.body;

      await Mahasiswa.findOneAndUpdate(
        { _id: id },
        {
          jenisKelamin,
          updatedAt: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
        }
      );

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Mahasiswa berhasil diubah!`);
      res.redirect("/admin/mahasiswa");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mahasiswa");
    }
  },
  destroyMahasiswa: async (req, res) => {
    try {
      const { valueList } = req.body;

      if (valueList.length === 0) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Maaf, Anda harus memilih satu atau beberapa data untuk dihapus!`
        );
        res.redirect("/admin/mahasiswa");
      } else {
        const idArray = valueList.split(",");
        await Mahasiswa.remove({ _id: { $in: idArray } });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `Mahasiswa berhasil dihapus!`);
        res.redirect("/admin/mahasiswa");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mahasiswa");
    }
  },
};
