const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// 회원가입
router.post("/register", authController.registerUser);

// 로그인
router.post("/login", authController.loginUser);

// 프로필 조회
router.get("/user-info", authController.getUserInfo);

// 프로필 수정
router.post("/update-profile", authController.updateProfile);

// 비밀번호 변경
router.post("/update-password", authController.updatePassword);

module.exports = router;
