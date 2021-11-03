const express = require("express");
const router = express.Router();

const { index } = require("../../controllers/admin/dashboardController");
const { isLogin } = require("../../middlewares");

router.use(isLogin);

router.get("/dashboard", index);

module.exports = router;
