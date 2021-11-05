const express = require("express");
const router = express.Router();

const { dashboard } = require("../../controllers/admin/dashboardController");
const { dosen } = require("../../controllers/admin/dosenController");
const {
  kelas,
  storeKelas,
  updateKelas,
  destroyKelas,
} = require("../../controllers/admin/kelasController");
const {
  mahasiswa,
  storeMahasiswa,
  updateMahasiswa,
  destroyMahasiswa,
} = require("../../controllers/admin/mahasiswaController");
const {
  mataKuliah,
  storeMataKuliah,
  updateMataKuliah,
  destroyMataKuliah,
} = require("../../controllers/admin/mataKuliahController");
const {
  programStudi,
  updateProgramStudi,
  destroyProgramStudi,
  storeProgramStudi,
} = require("../../controllers/admin/programStudiController");
const { isLogin } = require("../../middlewares");

router.use(isLogin);

router.get("/dashboard", dashboard);

router.get("/dosen", dosen);

router.get("/kelas", kelas);
router.post("/store-kelas", storeKelas);
router.put("/update-kelas", updateKelas);
router.delete("/destroy-kelas", destroyKelas);

router.get("/program-studi", programStudi);
router.post("/store-program-studi", storeProgramStudi);
router.put("/update-program-studi", updateProgramStudi);
router.delete("/destroy-program-studi", destroyProgramStudi);

router.get("/mahasiswa", mahasiswa);
router.post("/store-mahasiswa", storeMahasiswa);
router.put("/update-mahasiswa", updateMahasiswa);
router.delete("/destroy-mahasiswa", destroyMahasiswa);

router.get("/mata-kuliah", mataKuliah);
router.post("/store-mata-kuliah", storeMataKuliah);
router.put("/update-mata-kuliah", updateMataKuliah);
router.delete("/destroy-mata-kuliah", destroyMataKuliah);

module.exports = router;
