const express = require("express");
const router = express.Router();

const { dashboard } = require("../../controllers/admin/dashboardController");
const {
  dosen,
  detailDosen,
  createDosen,
  storeDosen,
  editDosen,
  updateDosen,
  destroyDosen,
} = require("../../controllers/admin/dosenController");
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
  createMahasiswa,
  editMahasiswa,
  detailMahasiswa,
} = require("../../controllers/admin/mahasiswaController");
const {
  mataKuliah,
  storeMataKuliah,
  updateMataKuliah,
  destroyMataKuliah,
  editMataKuliah,
} = require("../../controllers/admin/mataKuliahController");
const {
  profile,
  updateProfile,
  ubahEmail,
  updateEmail,
  ubahPassword,
  updatePassword,
} = require("../../controllers/admin/profileController");
const {
  programStudi,
  updateProgramStudi,
  destroyProgramStudi,
  storeProgramStudi,
} = require("../../controllers/admin/programStudiController");
const { isAdmin } = require("../../middlewares");

router.use(isAdmin);

router.get("/dashboard", dashboard);

router.get("/dosen", dosen);
router.get("/detail-dosen/:id", detailDosen);
router.get("/create-dosen", createDosen);
router.post("/store-dosen", storeDosen);
router.get("/edit-dosen/:id", editDosen);
router.put("/update-dosen/:id", updateDosen);
router.delete("/destroy-dosen", destroyDosen);

router.get("/kelas", kelas);
router.post("/store-kelas", storeKelas);
router.put("/update-kelas", updateKelas);
router.delete("/destroy-kelas", destroyKelas);

router.get("/program-studi", programStudi);
router.post("/store-program-studi", storeProgramStudi);
router.put("/update-program-studi", updateProgramStudi);
router.delete("/destroy-program-studi", destroyProgramStudi);

router.get("/mahasiswa", mahasiswa);
router.get("/mahasiswa/create", createMahasiswa);
router.post("/store-mahasiswa", storeMahasiswa);
router.get("/mahasiswa/:id/edit", editMahasiswa);
router.put("/:id/update-mahasiswa", updateMahasiswa);
router.get("/mahasiswa/:id/detail", detailMahasiswa);
router.delete("/destroy-mahasiswa", destroyMahasiswa);

router.get("/mata-kuliah", mataKuliah);
router.post("/store-mata-kuliah", storeMataKuliah);
router.get("/edit-mata-kuliah/:id", editMataKuliah);
router.put("/update-mata-kuliah/:id", updateMataKuliah);
router.delete("/destroy-mata-kuliah", destroyMataKuliah);

router.get("/profile", profile);
router.put("/update-profile", updateProfile);
router.get("/ubah-email", ubahEmail);
router.put("/update-email", updateEmail);
router.get("/ubah-password", ubahPassword);
router.put("/update-password", updatePassword);

module.exports = router;
