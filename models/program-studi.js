const mongoose = require("mongoose");
const dateAndTime = require("date-and-time");
const dateNow = new Date();

let programStudiSchema = mongoose.Schema({
  nama: {
    type: String,
    require: [true, "Nama program studi harus diisi!"],
  },
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("ProgramStudi", programStudiSchema);
