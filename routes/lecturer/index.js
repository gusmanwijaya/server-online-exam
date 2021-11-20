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

module.exports = router;
