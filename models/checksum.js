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
  mataKuliah: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MataKuliah",
  },
  fileName: {
    type: aesSchema,
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

  // START: Encrypt Digest
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
  // END: Encrypt Digest

  // START: Encrypt fileName
  const ivFileName = randomString.generate(16);
  const keyFileName =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22);
  const messageFileName = this.fileName.message;

  const cipherFileName = crypto.createCipheriv(
    algorithm,
    keyFileName,
    ivFileName
  );
  let dataEncryptedFileName = cipherFileName.update(
    messageFileName,
    "utf-8",
    "hex"
  );
  dataEncryptedFileName += cipherFileName.final("hex");

  this.fileName.iv = base64encode(ivFileName);
  this.fileName.key = base64encode(keyFileName);
  this.fileName.message = base64encode(dataEncryptedFileName);
  // END: Encrypt fileName

  next();
});
// END: Enkripsi password dengan AES 256 mode CBC dan Base64

module.exports = mongoose.model("Checksum", checksumSchema);
