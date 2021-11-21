const express = require("express");
const router = express.Router();

const multer = require("multer");
const os = require("os");

const { signIn } = require("../../controllers/api/apiController");

router.post("/sign-in", signIn);

module.exports = router;
