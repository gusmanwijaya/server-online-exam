const mongoose = require("mongoose");
const crypto = require("crypto");
const randomString = require("randomstring");
const { base64encode } = require("nodejs-base64");

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
    type: aesSchema,
  },
  jumlahBenar: {
    type: aesSchema,
  },
  nilai: {
    type: aesSchema,
  },
  masuk: {
    type: String,
  },
  selesai: {
    type: String,
  },
});

hasilUjianSchema.pre("save", function (next) {
  let dateNow = new Date();
  const algorithm = "aes-256-cbc";

  if (this.listJawaban.message !== "") {
    // START: Enkripsi listJawaban dengan AES 256 mode CBC dan Base64
    const ivListJawaban = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyListJawaban =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messageListJawaban = this.listJawaban.message;

    const cipherListJawaban = crypto.createCipheriv(
      algorithm,
      keyListJawaban,
      ivListJawaban
    );
    let dataEncryptedListJawaban = cipherListJawaban.update(
      messageListJawaban,
      "utf-8",
      "hex"
    );
    dataEncryptedListJawaban += cipherListJawaban.final("hex");

    this.listJawaban.iv = base64encode(ivListJawaban);
    this.listJawaban.key = base64encode(keyListJawaban);
    this.listJawaban.message = base64encode(dataEncryptedListJawaban);
    // END: Enkripsi listJawaban dengan AES 256 mode CBC dan Base64
  }

  if (this.jumlahBenar.message !== "") {
    // START: Enkripsi jumlahBenar dengan AES 256 mode CBC dan Base64
    const ivJumlahBenar = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyJumlahBenar =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messageJumlahBenar = this.jumlahBenar.message;

    const cipherJumlahBenar = crypto.createCipheriv(
      algorithm,
      keyJumlahBenar,
      ivJumlahBenar
    );
    let dataEncryptedJumlahBenar = cipherJumlahBenar.update(
      messageJumlahBenar,
      "utf-8",
      "hex"
    );
    dataEncryptedJumlahBenar += cipherJumlahBenar.final("hex");

    this.jumlahBenar.iv = base64encode(ivJumlahBenar);
    this.jumlahBenar.key = base64encode(keyJumlahBenar);
    this.jumlahBenar.message = base64encode(dataEncryptedJumlahBenar);
    // END: Enkripsi jumlahBenar dengan AES 256 mode CBC dan Base64
  }

  if (this.nilai.message !== "") {
    // START: Enkripsi nilai dengan AES 256 mode CBC dan Base64
    const ivNilai = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyNilai =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messageNilai = this.nilai.message;

    const cipherNilai = crypto.createCipheriv(algorithm, keyNilai, ivNilai);
    let dataEncryptedNilai = cipherNilai.update(messageNilai, "utf-8", "hex");
    dataEncryptedNilai += cipherNilai.final("hex");

    this.nilai.iv = base64encode(ivNilai);
    this.nilai.key = base64encode(keyNilai);
    this.nilai.message = base64encode(dataEncryptedNilai);
    // END: Enkripsi nilai dengan AES 256 mode CBC dan Base64
  }

  next();
});

module.exports = mongoose.model("HasilUjian", hasilUjianSchema);
