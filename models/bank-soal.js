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

let bankSoalSchema = mongoose.Schema({
  dosen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dosen",
  },
  mataKuliah: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MataKuliah",
  },
  bobot: {
    type: Number,
    default: 0,
    require: [true, "Bobot soal harus diisi!"],
  },
  soalGambar: {
    type: String,
  },
  soal: {
    type: aesSchema,
  },
  pilihanA: {
    type: aesSchema,
  },
  pilihanB: {
    type: aesSchema,
  },
  pilihanC: {
    type: aesSchema,
  },
  pilihanD: {
    type: aesSchema,
  },
  pilihanE: {
    type: aesSchema,
  },
  pilihanGambarA: {
    type: String,
  },
  pilihanGambarB: {
    type: String,
  },
  pilihanGambarC: {
    type: String,
  },
  pilihanGambarD: {
    type: String,
  },
  pilihanGambarE: {
    type: String,
  },
  kunciJawaban: {
    type: aesSchema,
  },
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
  },
});

// START: Enkripsi soal dengan AES 256 mode CBC dan Base64
bankSoalSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
  const message = this.soal.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.soal.iv = base64encode(iv);
  this.soal.key = base64encode(key);
  this.soal.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi soal dengan AES 256 mode CBC dan Base64

// START: Enkripsi pilihanA dengan AES 256 mode CBC dan Base64
bankSoalSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
  const message = this.pilihanA.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.pilihanA.iv = base64encode(iv);
  this.pilihanA.key = base64encode(key);
  this.pilihanA.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi pilihanA dengan AES 256 mode CBC dan Base64

// START: Enkripsi pilihanB dengan AES 256 mode CBC dan Base64
bankSoalSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
  const message = this.pilihanB.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.pilihanB.iv = base64encode(iv);
  this.pilihanB.key = base64encode(key);
  this.pilihanB.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi pilihanB dengan AES 256 mode CBC dan Base64

// START: Enkripsi pilihanC dengan AES 256 mode CBC dan Base64
bankSoalSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
  const message = this.pilihanC.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.pilihanC.iv = base64encode(iv);
  this.pilihanC.key = base64encode(key);
  this.pilihanC.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi pilihanC dengan AES 256 mode CBC dan Base64

// START: Enkripsi pilihanD dengan AES 256 mode CBC dan Base64
bankSoalSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
  const message = this.pilihanD.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.pilihanD.iv = base64encode(iv);
  this.pilihanD.key = base64encode(key);
  this.pilihanD.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi pilihanD dengan AES 256 mode CBC dan Base64

// START: Enkripsi pilihanE dengan AES 256 mode CBC dan Base64
bankSoalSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
  const message = this.pilihanE.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.pilihanE.iv = base64encode(iv);
  this.pilihanE.key = base64encode(key);
  this.pilihanE.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi pilihanE dengan AES 256 mode CBC dan Base64

// START: Enkripsi kunciJawaban dengan AES 256 mode CBC dan Base64
bankSoalSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
  const message = this.kunciJawaban.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.kunciJawaban.iv = base64encode(iv);
  this.kunciJawaban.key = base64encode(key);
  this.kunciJawaban.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi kunciJawaban dengan AES 256 mode CBC dan Base64

module.exports = mongoose.model("BankSoal", bankSoalSchema);
