const mongoose = require("mongoose");
const dateAndTime = require("date-and-time");
let dateNow = new Date();

let jadwalUjianSchema = mongoose.Schema({
  dosen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dosen",
  },
  mataKuliah: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MataKuliah",
  },
  namaUjian: {
    type: String,
  },
  jumlahSoal: {
    type: Number,
  },
  durasiUjian: {
    type: Number,
  },
  mulaiUjian: {
    type: String,
  },
  terlambatUjian: {
    type: String,
  },
  token: {
    type: String,
  },
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
});

module.exports = mongoose.model("JadwalUjian", jadwalUjianSchema);
