const mongoose = require("mongoose");
const dateAndTime = require("date-and-time");
const dateNow = new Date();

let kelasSchema = mongoose.Schema({
  nama: {
    type: String,
    require: [true, "Nama kelas harus diisi!"],
    unique: true,
  },
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
  },
});

// START: Check nama agar tidak boleh sama
kelasSchema.path("nama").validate(
  async function (value) {
    try {
      const count = await this.model("Kelas").countDocuments({
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

module.exports = mongoose.model("Kelas", kelasSchema);
