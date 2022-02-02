const Mahasiswa = require("../../models/mahasiswa");
const ProgramStudi = require("../../models/program-studi");
const MataKuliah = require("../../models/mata-kuliah");

const dateAndTime = require("date-and-time");
const jwt_decode = require("jwt-decode");
const { base64decode } = require("nodejs-base64");

module.exports = {
  mahasiswa: async (req, res) => {
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

      const mahasiswas = await Mahasiswa.find()
        .populate("programStudi", "_id nama", "ProgramStudi")
        .sort({ npm: "asc" });

      res.render("admin/mahasiswa/index", {
        alert,
        mahasiswas,
        url: originalUrl[2],
        title: "Mahasiswa",
        payload,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mahasiswa");
    }
  },
  createMahasiswa: async (req, res) => {
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
      const mataKuliahs = await MataKuliah.find().sort({ nama: "asc" });

      res.render("admin/mahasiswa/create", {
        alert,
        programStudies,
        mataKuliahs,
        url: originalUrl[2],
        title: "Mahasiswa",
        payload,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mahasiswa/create");
    }
  },
  storeMahasiswa: async (req, res) => {
    try {
      const {
        nama,
        npm,
        email,
        password,
        jenisKelamin,
        mataKuliah,
        programStudi,
      } = req.body;

      if (password.length < 10) {
        req.flash("alertStatus", "error");
        req.flash(
          "alertMessage",
          `Password harus lebih dari sama dengan (>=) 10 karakter!`
        );
        res.redirect("/admin/mahasiswa/create");
      } else {
        await Mahasiswa.create({
          nama,
          npm,
          email,
          password: {
            message: password,
          },
          jenisKelamin,
          mataKuliah,
          programStudi,
        });

        req.flash("alertStatus", "success");
        req.flash("alertMessage", `${nama} (${npm}) berhasil ditambahkan!`);
        res.redirect("/admin/mahasiswa");
      }
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect("/admin/mahasiswa/create");
    }
  },
  editMahasiswa: async (req, res) => {
    const { id } = req.params;

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

      const mahasiswa = await Mahasiswa.findOne({ _id: id })
        .populate("mataKuliah")
        .populate("programStudi");
      const programStudies = await ProgramStudi.find().sort({ nama: "asc" });
      const mataKuliahs = await MataKuliah.find().sort({ nama: "asc" });

      res.render("admin/mahasiswa/edit", {
        alert,
        mahasiswa,
        programStudies,
        mataKuliahs,
        url: originalUrl[2],
        title: "Mahasiswa",
        payload,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/mahasiswa/${id}/edit`);
    }
  },
  updateMahasiswa: async (req, res) => {
    const { id } = req.params;

    try {
      let dateNow = new Date();

      const { jenisKelamin, mataKuliah, programStudi } = req.body;

      await Mahasiswa.findOneAndUpdate(
        { _id: id },
        {
          jenisKelamin,
          mataKuliah,
          programStudi,
          updatedAt: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
        }
      );

      req.flash("alertStatus", "success");
      req.flash("alertMessage", `Mahasiswa berhasil diubah!`);
      res.redirect("/admin/mahasiswa");
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/mahasiswa/${id}/edit`);
    }
  },
  detailMahasiswa: async (req, res) => {
    const { id } = req.params;

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

      const mahasiswa = await Mahasiswa.findOne({ _id: id })
        .populate("mataKuliah")
        .populate("programStudi");

      res.render("admin/mahasiswa/detail", {
        alert,
        mahasiswa,
        url: originalUrl[2],
        title: "Mahasiswa",
        payload,
      });
    } catch (error) {
      req.flash("alertStatus", "error");
      req.flash("alertMessage", `${error.message}`);
      res.redirect(`/admin/mahasiswa/${id}/detail`);
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
        await Mahasiswa.deleteMany({ _id: { $in: idArray } });

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
