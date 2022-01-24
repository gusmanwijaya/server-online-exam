const mongoose = require("mongoose");
const { base64encode } = require("nodejs-base64");
const dateAndTime = require("date-and-time");
const crypto = require("crypto");
const randomString = require("randomstring");
let dateNow = new Date();

let aesSchema = mongoose.Schema({
  iv: {
    type: String,
  },
  key: {
    type: String,
  },
  message: {
    type: String,
  },
});

let checksumSchema = mongoose.Schema({
  namaFile: {
    type: String,
  },
  digest: {
    type: aesSchema,
  },
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
});

// START: Enkripsi digest dengan AES 256 mode CBC dan Base64
checksumSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16);
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22);
  const message = this.digest.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.digest.iv = base64encode(iv);
  this.digest.key = base64encode(key);
  this.digest.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi password dengan AES 256 mode CBC dan Base64

module.exports = mongoose.model("Checksum", checksumSchema);
