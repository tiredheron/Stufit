// routes/planRoutes.js
const express = require("express");
const router = express.Router();
const planController = require("../controllers/planController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

// 1) Plan 목록 조회 / 생성
router.get("/", planController.getPlans);      // GET /api/plans?user_id=...
router.post("/", planController.createPlan);   // POST /api/plans

// 2) (옵션) AI 관련 - 지금은 RN -> FastAPI 직접 호출이라 안 써도 됨
// router.post("/ai/chat", planController.planAiChat);
// router.post("/ai/chat-with-file", upload.single("file"), planController.planAiChatWithFile);

// 3) AI로 생성된 JSON + 텍스트 저장
// POST /api/plans/ai/save
router.post("/ai/save", planController.saveAiPlan);
router.get("/full-list", planController.getPlansWithTodos);
module.exports = router;