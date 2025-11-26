const express = require("express");
const app = express();
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const rankingRoutes = require("./routes/rankingRoutes");

require("dotenv").config();

app.use(cors());
app.use(express.json());

// 회원가입 / 로그인 라우터
app.use("/auth", authRoutes);
// 메인페이지 부분의 날짜별 리스트 가져오기
app.use("/todo", todoRoutes);
// Learning Ranking 라우터
app.use("/ranking", rankingRoutes);


app.listen(4000, () => {
  console.log("🚀 Backend running on port 4000");
});
