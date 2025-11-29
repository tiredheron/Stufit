console.log(">>> CURRENT FILE:", __filename);
console.log(">>> CURRENT DIR:", __dirname);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const rankingRoutes = require("./routes/rankingRoutes");
const planRoutes = require("./routes/planRoutes");
const chatRoutes = require("./routes/chatRoutes.js");
const aiRoutes = require("./routes/aiRoutes");
const recordRoutes = require("./routes/recordRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// 회원가입 / 로그인 라우터
app.use("/auth", authRoutes);
// 메인페이지 부분의 날짜별 리스트 가져오기
app.use("/todo", todoRoutes);
// Learning Ranking 라우터
app.use("/ranking", rankingRoutes);
// 플랜/AI 라우트
app.use("/api/plans", planRoutes);
// 채팅 기록
app.use("/api/chat", chatRoutes);
app.use("/ai", aiRoutes);
// 기록용 페이지
app.use("/record", recordRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on ${PORT}`);
});