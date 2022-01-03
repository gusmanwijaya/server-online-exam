const mongoose = require("mongoose");
const dateAndTime = require("date-and-time");
let dateNow = new Date();

let hasilUjianSchema = mongoose.Schema({
  jadwalUjian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JadwalUjian",
  },
  mahasiswa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mahasiswa",
  },
  listJawaban: {
    type: String,
  },
  jumlahBenar: {
    type: Number,
  },
  nilai: {
    type: Number,
  },
  masuk: {
    type: String,
  },
  selesai: {
    type: String,
  },
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
});

module.exports = mongoose.model("HasilUjian", hasilUjianSchema);
