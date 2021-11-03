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
const { isLogin } = require("../../middlewares");

router.use(isLogin);

router.get("/dashboard", dashboard);

router.get("/dosen", dosen);

router.get("/kelas", kelas);
router.post("/store-kelas", storeKelas);
router.put("/update-kelas", updateKelas);
router.delete("/destroy-kelas", destroyKelas);

module.exports = router;
