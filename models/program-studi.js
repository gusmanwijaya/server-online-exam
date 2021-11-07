const mongoose = require("mongoose");
const dateAndTime = require("date-and-time");
let dateNow = new Date();

let programStudiSchema = mongoose.Schema({
  nama: {
    type: String,
    require: [true, "Nama program studi harus diisi!"],
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
programStudiSchema.path("nama").validate(
  async function (value) {
    try {
      const count = await this.model("ProgramStudi").countDocuments({
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

module.exports = mongoose.model("ProgramStudi", programStudiSchema);
