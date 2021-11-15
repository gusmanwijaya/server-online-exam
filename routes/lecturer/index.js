const express = require("express");
const router = express.Router();
const { isLecturer } = require("../../middlewares");

const { dashboard } = require("../../controllers/lecturer/dashboardController");
const {
  bankSoal,
  soal,
  createSoal,
} = require("../../controllers/lecturer/bankSoalController");

router.use(isLecturer);

router.get("/dashboard", dashboard);
router.get("/bank-soal", bankSoal);
router.get("/bank-soal/:id", soal);
router.get("/bank-soal/:id/create-soal", createSoal);

module.exports = router;
