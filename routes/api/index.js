const express = require("express");
const router = express.Router();

const multer = require("multer");
const os = require("os");

const {
  signIn,
  getJadwalUjian,
  getSoalUjian,
  getDetailJadwalUjian,
} = require("../../controllers/api/apiController");
const { isMahasiswa } = require("../../middlewares");

router.post("/sign-in", signIn);

router.use(isMahasiswa);
router.get("/jadwal-ujian", getJadwalUjian);
router.get("/jadwal-ujian/:id", getDetailJadwalUjian);
router.get("/:id/soal-ujian", getSoalUjian);

module.exports = router;
