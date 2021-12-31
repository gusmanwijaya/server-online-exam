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
    type: aesSchema,
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
    type: aesSchema,
  },
  pilihanGambarB: {
    type: aesSchema,
  },
  pilihanGambarC: {
    type: aesSchema,
  },
  pilihanGambarD: {
    type: aesSchema,
  },
  pilihanGambarE: {
    type: aesSchema,
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

bankSoalSchema.pre("save", function (next) {
  let dateNow = new Date();
  const algorithm = "aes-256-cbc";

  if (this.soalGambar.message !== "") {
    // START: Enkripsi soalGambar dengan AES 256 mode CBC dan Base64
    const ivSoalGambar = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keySoalGambar =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messageSoalGambar = this.soalGambar.message;

    const cipherSoalGambar = crypto.createCipheriv(
      algorithm,
      keySoalGambar,
      ivSoalGambar
    );
    let dataEncryptedSoalGambar = cipherSoalGambar.update(
      messageSoalGambar,
      "utf-8",
      "hex"
    );
    dataEncryptedSoalGambar += cipherSoalGambar.final("hex");

    this.soalGambar.iv = base64encode(ivSoalGambar);
    this.soalGambar.key = base64encode(keySoalGambar);
    this.soalGambar.message = base64encode(dataEncryptedSoalGambar);
    // END: Enkripsi soalGambar dengan AES 256 mode CBC dan Base64
  }

  if (this.soal.message !== "") {
    // START: Enkripsi soal dengan AES 256 mode CBC dan Base64
    const ivSoal = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keySoal =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messageSoal = this.soal.message;

    const cipherSoal = crypto.createCipheriv(algorithm, keySoal, ivSoal);
    let dataEncryptedSoal = cipherSoal.update(messageSoal, "utf-8", "hex");
    dataEncryptedSoal += cipherSoal.final("hex");

    this.soal.iv = base64encode(ivSoal);
    this.soal.key = base64encode(keySoal);
    this.soal.message = base64encode(dataEncryptedSoal);
    // END: Enkripsi soal dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanA.message !== "") {
    // START: Enkripsi pilihanA dengan AES 256 mode CBC dan Base64
    const ivPilihanA = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanA =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanA = this.pilihanA.message;

    const cipherPilihanA = crypto.createCipheriv(
      algorithm,
      keyPilihanA,
      ivPilihanA
    );
    let dataEncryptedPilihanA = cipherPilihanA.update(
      messagePilihanA,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanA += cipherPilihanA.final("hex");

    this.pilihanA.iv = base64encode(ivPilihanA);
    this.pilihanA.key = base64encode(keyPilihanA);
    this.pilihanA.message = base64encode(dataEncryptedPilihanA);
    // END: Enkripsi pilihanA dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanB.message !== "") {
    // START: Enkripsi pilihanB dengan AES 256 mode CBC dan Base64
    const ivPilihanB = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanB =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanB = this.pilihanB.message;

    const cipherPilihanB = crypto.createCipheriv(
      algorithm,
      keyPilihanB,
      ivPilihanB
    );
    let dataEncryptedPilihanB = cipherPilihanB.update(
      messagePilihanB,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanB += cipherPilihanB.final("hex");

    this.pilihanB.iv = base64encode(ivPilihanB);
    this.pilihanB.key = base64encode(keyPilihanB);
    this.pilihanB.message = base64encode(dataEncryptedPilihanB);
    // END: Enkripsi pilihanB dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanC.message !== "") {
    // START: Enkripsi pilihanC dengan AES 256 mode CBC dan Base64
    const ivPilihanC = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanC =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanC = this.pilihanC.message;

    const cipherPilihanC = crypto.createCipheriv(
      algorithm,
      keyPilihanC,
      ivPilihanC
    );
    let dataEncryptedPilihanC = cipherPilihanC.update(
      messagePilihanC,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanC += cipherPilihanC.final("hex");

    this.pilihanC.iv = base64encode(ivPilihanC);
    this.pilihanC.key = base64encode(keyPilihanC);
    this.pilihanC.message = base64encode(dataEncryptedPilihanC);
    // END: Enkripsi pilihanC dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanD.message !== "") {
    // START: Enkripsi pilihanD dengan AES 256 mode CBC dan Base64
    const ivPilihanD = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanD =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanD = this.pilihanD.message;

    const cipherPilihanD = crypto.createCipheriv(
      algorithm,
      keyPilihanD,
      ivPilihanD
    );
    let dataEncryptedPilihanD = cipherPilihanD.update(
      messagePilihanD,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanD += cipherPilihanD.final("hex");

    this.pilihanD.iv = base64encode(ivPilihanD);
    this.pilihanD.key = base64encode(keyPilihanD);
    this.pilihanD.message = base64encode(dataEncryptedPilihanD);
    // END: Enkripsi pilihanD dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanE.message !== "") {
    // START: Enkripsi pilihanE dengan AES 256 mode CBC dan Base64
    const ivPilihanE = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanE =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanE = this.pilihanE.message;

    const cipherPilihanE = crypto.createCipheriv(
      algorithm,
      keyPilihanE,
      ivPilihanE
    );
    let dataEncryptedPilihanE = cipherPilihanE.update(
      messagePilihanE,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanE += cipherPilihanE.final("hex");

    this.pilihanE.iv = base64encode(ivPilihanE);
    this.pilihanE.key = base64encode(keyPilihanE);
    this.pilihanE.message = base64encode(dataEncryptedPilihanE);
    // END: Enkripsi pilihanE dengan AES 256 mode CBC dan Base64
  }

  if (this.kunciJawaban.message !== "") {
    // START: Enkripsi kunciJawaban dengan AES 256 mode CBC dan Base64
    const ivKunciJawaban = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyKunciJawaban =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messageKunciJawaban = this.kunciJawaban.message;

    const cipherKunciJawaban = crypto.createCipheriv(
      algorithm,
      keyKunciJawaban,
      ivKunciJawaban
    );
    let dataEncryptedKunciJawaban = cipherKunciJawaban.update(
      messageKunciJawaban,
      "utf-8",
      "hex"
    );
    dataEncryptedKunciJawaban += cipherKunciJawaban.final("hex");

    this.kunciJawaban.iv = base64encode(ivKunciJawaban);
    this.kunciJawaban.key = base64encode(keyKunciJawaban);
    this.kunciJawaban.message = base64encode(dataEncryptedKunciJawaban);
    // END: Enkripsi kunciJawaban dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanGambarA.message !== "") {
    // START: Enkripsi pilihanGambarA dengan AES 256 mode CBC dan Base64
    const ivPilihanGambarA = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanGambarA =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanGambarA = this.pilihanGambarA.message;

    const cipherPilihanGambarA = crypto.createCipheriv(
      algorithm,
      keyPilihanGambarA,
      ivPilihanGambarA
    );
    let dataEncryptedPilihanGambarA = cipherPilihanGambarA.update(
      messagePilihanGambarA,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanGambarA += cipherPilihanGambarA.final("hex");

    this.pilihanGambarA.iv = base64encode(ivPilihanGambarA);
    this.pilihanGambarA.key = base64encode(keyPilihanGambarA);
    this.pilihanGambarA.message = base64encode(dataEncryptedPilihanGambarA);
    // END: Enkripsi pilihanGambarA dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanGambarB.message !== "") {
    // START: Enkripsi pilihanGambarB dengan AES 256 mode CBC dan Base64
    const ivPilihanGambarB = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanGambarB =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanGambarB = this.pilihanGambarB.message;

    const cipherPilihanGambarB = crypto.createCipheriv(
      algorithm,
      keyPilihanGambarB,
      ivPilihanGambarB
    );
    let dataEncryptedPilihanGambarB = cipherPilihanGambarB.update(
      messagePilihanGambarB,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanGambarB += cipherPilihanGambarB.final("hex");

    this.pilihanGambarB.iv = base64encode(ivPilihanGambarB);
    this.pilihanGambarB.key = base64encode(keyPilihanGambarB);
    this.pilihanGambarB.message = base64encode(dataEncryptedPilihanGambarB);
    // END: Enkripsi pilihanGambarB dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanGambarC.message !== "") {
    // START: Enkripsi pilihanGambarC dengan AES 256 mode CBC dan Base64
    const ivPilihanGambarC = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanGambarC =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanGambarC = this.pilihanGambarC.message;

    const cipherPilihanGambarC = crypto.createCipheriv(
      algorithm,
      keyPilihanGambarC,
      ivPilihanGambarC
    );
    let dataEncryptedPilihanGambarC = cipherPilihanGambarC.update(
      messagePilihanGambarC,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanGambarC += cipherPilihanGambarC.final("hex");

    this.pilihanGambarC.iv = base64encode(ivPilihanGambarC);
    this.pilihanGambarC.key = base64encode(keyPilihanGambarC);
    this.pilihanGambarC.message = base64encode(dataEncryptedPilihanGambarC);
    // END: Enkripsi pilihanGambarC dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanGambarD.message !== "") {
    // START: Enkripsi pilihanGambarD dengan AES 256 mode CBC dan Base64
    const ivPilihanGambarD = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanGambarD =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanGambarD = this.pilihanGambarD.message;

    const cipherPilihanGambarD = crypto.createCipheriv(
      algorithm,
      keyPilihanGambarD,
      ivPilihanGambarD
    );
    let dataEncryptedPilihanGambarD = cipherPilihanGambarD.update(
      messagePilihanGambarD,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanGambarD += cipherPilihanGambarD.final("hex");

    this.pilihanGambarD.iv = base64encode(ivPilihanGambarD);
    this.pilihanGambarD.key = base64encode(keyPilihanGambarD);
    this.pilihanGambarD.message = base64encode(dataEncryptedPilihanGambarD);
    // END: Enkripsi pilihanGambarD dengan AES 256 mode CBC dan Base64
  }

  if (this.pilihanGambarE.message !== "") {
    // START: Enkripsi pilihanGambarE dengan AES 256 mode CBC dan Base64
    const ivPilihanGambarE = randomString.generate(16); //Harus 16 bytes atau setara 16 karakter
    const keyPilihanGambarE =
      Math.floor(dateNow.getTime() / 1000).toString() +
      randomString.generate(22); //Harus 32 bytes atau setara 32 karakter
    const messagePilihanGambarE = this.pilihanGambarE.message;

    const cipherPilihanGambarE = crypto.createCipheriv(
      algorithm,
      keyPilihanGambarE,
      ivPilihanGambarE
    );
    let dataEncryptedPilihanGambarE = cipherPilihanGambarE.update(
      messagePilihanGambarE,
      "utf-8",
      "hex"
    );
    dataEncryptedPilihanGambarE += cipherPilihanGambarE.final("hex");

    this.pilihanGambarE.iv = base64encode(ivPilihanGambarE);
    this.pilihanGambarE.key = base64encode(keyPilihanGambarE);
    this.pilihanGambarE.message = base64encode(dataEncryptedPilihanGambarE);
    // END: Enkripsi pilihanGambarE dengan AES 256 mode CBC dan Base64
  }

  next();
});

module.exports = mongoose.model("BankSoal", bankSoalSchema);
