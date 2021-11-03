const mongoose = require("mongoose");
const { base64encode } = require("nodejs-base64");
const dateAndTime = require("date-and-time");
const crypto = require("crypto");
const randomString = require("randomstring");
const dateNow = new Date();

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

let adminSchema = mongoose.Schema({
  nama: {
    type: String,
  },
  password: {
    type: aesSchema,
  },
  email: {
    type: String,
  },
  nohp: {
    type: Number,
  },
  role: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: String,
    default: dateAndTime.format(dateNow, "dddd, D MMMM YYYY HH:mm:ss"),
  },
  updatedAt: {
    type: String,
  },
});

// START: Check email agar tidak boleh sama
adminSchema.path("email").validate(
  async function (value) {
    try {
      const count = await this.model("Admin").countDocuments({ email: value });
      return !count;
    } catch (error) {
      throw error;
    }
  },
  (attr) => `${attr.value} sudah terdaftar!`
);
// END: Check email agar tidak boleh sama

// START: Enkripsi password dengan AES 256 mode CBC dan Base64
adminSchema.pre("save", function (next) {
  const algorithm = "aes-256-cbc";
  const iv = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
  const key =
    Math.floor(dateNow.getTime() / 1000).toString() + randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
  const message = this.password.message;

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let dataEncrypted = cipher.update(message, "utf-8", "hex");
  dataEncrypted += cipher.final("hex");

  this.password.iv = base64encode(iv);
  this.password.key = base64encode(key);
  this.password.message = base64encode(dataEncrypted);

  next();
});
// END: Enkripsi password dengan AES 256 mode CBC dan Base64

module.exports = mongoose.model("Admin", adminSchema);
