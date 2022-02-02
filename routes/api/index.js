const express = require("express");
const router = express.Router();

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
} = require("../../controllers/api/apiController");
const { isMahasiswa } = require("../../middlewares");

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
