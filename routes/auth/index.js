const express = require("express");
const router = express.Router();

const {
  signIn,
  storeAdminSignIn,
  signOut,
} = require("../../controllers/auth/authController");

router.get("/sign-in", signIn);
router.post("/store", storeAdminSignIn);
router.get("/sign-out", signOut);

module.exports = router;
