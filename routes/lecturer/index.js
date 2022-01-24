const express = require("express");
const router = express.Router();
const multer = require("multer");
const os = require("os");
const { isLecturer } = require("../../middlewares");

const { dashboard } = require("../../controllers/lecturer/dashboardController");
const {
  bankSoal,
  soal,
  createSoal,
  storeSoal,
  destroySoal,
  detailSoal,
  editSoal,
  updateSoal,
} = require("../../controllers/lecturer/bankSoalController");
const {
  jadwalUjian,
  createJadwalUjian,
  storeJadwalUjian,
  destroyJadwalUjian,
  regenerateTokenJadwalUjian,
} = require("../../controllers/lecturer/jadwalUjianController");
const {
  profile,
  ubahEmail,
  updateEmail,
  ubahPassword,
  updatePassword,
} = require("../../controllers/lecturer/profileController");
const {
  mataKuliahHasilUjian,
  hasilUjian,
  detailHasilUjian,
  generatePdf,
  downloadPdf,
} = require("../../controllers/lecturer/hasilUjianController");
const {
  checksum,
  storeChecksum,
} = require("../../controllers/lecturer/checksumController");

router.use(isLecturer);

router.get("/dashboard", dashboard);

router.get("/bank-soal", bankSoal);
router.get("/bank-soal/:id", soal);
router.get("/bank-soal/:id/create-soal", createSoal);
router.post(
  "/bank-soal/:id/store-soal",
  multer({ dest: os.tmpdir() }).fields([
    { name: "soalGambar" },
    { name: "pilihanGambarA" },
    { name: "pilihanGambarB" },
    { name: "pilihanGambarC" },
    { name: "pilihanGambarD" },
    { name: "pilihanGambarE" },
  ]),
  storeSoal
);
router.get("/bank-soal/:idMatkul/detail-soal/:idSoal", detailSoal);
router.get("/bank-soal/:idMatkul/edit-soal/:idSoal", editSoal);
router.put(
  "/bank-soal/:idMatkul/update-soal/:idSoal",
  multer({ dest: os.tmpdir() }).fields([
    { name: "soalGambar" },
    { name: "pilihanGambarA" },
    { name: "pilihanGambarB" },
    { name: "pilihanGambarC" },
    { name: "pilihanGambarD" },
    { name: "pilihanGambarE" },
  ]),
  updateSoal
);
router.delete("/bank-soal/:id/destroy-soal", destroySoal);

router.get("/jadwal-ujian", jadwalUjian);
router.get("/jadwal-ujian/create-jadwal-ujian", createJadwalUjian);
router.post("/jadwal-ujian/store-jadwal-ujian", storeJadwalUjian);
router.delete("/jadwal-ujian/destroy-jadwal-ujian", destroyJadwalUjian);
router.put("/jadwal-ujian/regenerate-token/:id", regenerateTokenJadwalUjian);

router.get("/hasil-ujian", mataKuliahHasilUjian);
router.get("/hasil-ujian/:id", hasilUjian);
router.get(
  "/hasil-ujian/:idMatkul/detail-hasil-ujian/:idHasilUjian",
  detailHasilUjian
);
router.get("/hasil-ujian/:idMatkul/generate-pdf", generatePdf);
router.get("/hasil-ujian/:idMatkul/download-pdf", downloadPdf);

router.get("/checksum", checksum);
router.post(
  "/checksum/store",
  multer({
    dest: os.tmpdir(),
  }).single("file"),
  storeChecksum
);

router.get("/profile", profile);
router.get("/ubah-email", ubahEmail);
router.put("/update-email", updateEmail);
router.get("/ubah-password", ubahPassword);
router.put("/update-password", updatePassword);

module.exports = router;
