const express = require("express");
const router = express.Router();

const {
  signIn,
  storeSignIn,
  signOut,
  lupaPassword,
  storeLupaPassword,
  verifikasiOTP,
  storeVerifikasiOTP,
} = require("../../controllers/auth/authController");
const { isNotSendEmailOTP } = require("../../middlewares/index");

router.get("/sign-in", signIn);
router.post("/store", storeSignIn);
router.get("/sign-out", signOut);
router.get("/lupa-password", lupaPassword);
router.post("/store-lupa-password", storeLupaPassword);
router.get("/verifikasi-otp", isNotSendEmailOTP, verifikasiOTP);
router.post("/store-verifikasi-otp", isNotSendEmailOTP, storeVerifikasiOTP);

module.exports = router;
