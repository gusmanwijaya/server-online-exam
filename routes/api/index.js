const express = require("express");
const router = express.Router();

const multer = require("multer");
const os = require("os");

const {
  signIn,
  getJadwalUjian,
  getSoalUjian,
  getDetailJadwalUjian,
  getTokenUjian,
  getOneSoalUjian,
  getKunciJawaban,
  postHasilUjian,
  getHasilUjian,
  postPengujianAlgoritmaAES256CBCandBase64,
  postPengujianAlgoritmaSHA256,
} = require("../../controllers/api/apiController");
const { isMahasiswa } = require("../../middlewares");

router.post(
  "/pengujian-aes-256-cbc-base-64",
  postPengujianAlgoritmaAES256CBCandBase64
);
router.post(
  "/pengujian-sha-256",
  multer({ dest: os.tmpdir() }).single("file"),
  postPengujianAlgoritmaSHA256
);

router.post("/sign-in", signIn);

router.use(isMahasiswa);
router.get("/jadwal-ujian", getJadwalUjian);
router.get("/jadwal-ujian/:idUjian", getDetailJadwalUjian);
router.get("/:idUjian/token-ujian", getTokenUjian);
router.get("/:idUjian/soal-ujian", getSoalUjian);
router.get("/one-soal-ujian", getOneSoalUjian);
router.get("/kunci-jawaban", getKunciJawaban);
router.post("/hasil-ujian", postHasilUjian);
router.get("/hasil-ujian", getHasilUjian);

module.exports = router;
