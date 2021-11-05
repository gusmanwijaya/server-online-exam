const mongoose = require("mongoose");
const dateAndTime = require("date-and-time");
const dateNow = new Date();

let mataKuliahSchema = mongoose.Schema({
  nama: {
    type: String,
    require: [true, "Nama mata kuliah harus diisi!"],
  },
  kelas: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
    },
  ],
  programStudi: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProgramStudi",
    },
  ],
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
  },
});

// START: Check nama agar tidak boleh sama
mataKuliahSchema.path("nama").validate(
  async function (value) {
    try {
      const count = await this.model("MataKuliah").countDocuments({
        nama: value,
      });
      return !count;
    } catch (error) {
      throw error;
    }
  },
  (attr) => `${attr.value} sudah terdaftar!`
);
// END: Check nama agar tidak boleh sama

module.exports = mongoose.model("MataKuliah", mataKuliahSchema);
