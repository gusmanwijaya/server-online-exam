const mongoose = require("mongoose");
const dateAndTime = require("date-and-time");
const dateNow = new Date();

let kelasSchema = mongoose.Schema({
  nama: {
    type: String,
  },
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
  },
});

module.exports = mongoose.model("Kelas", kelasSchema);
