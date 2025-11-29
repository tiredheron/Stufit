const db = require("../db");
const axios = require("axios");

// FastAPI URL
const FAST_API_PLAN_TO_TODOS = "http://127.0.0.1:8000/plan-to-todos";

exports.saveAiPlan = async (req, res) => {
  try {
    const { plan_id, plan_text, start_date } = req.body;

    if (!plan_id || !plan_text) {
      return res.status(400).json({ error: "plan_id and plan_text required" });
    }

    // 1) FastAPI 호출 → plan_text를 JSON으로 변환
    const todosRes = await axios.post(FAST_API_PLAN_TO_TODOS, {
      plan_text: plan_text
    });

    const todos = todosRes.data.todos;

    if (!Array.isArray(todos) || todos.length === 0) {
      return res.status(500).json({ error: "Failed to generate todos JSON" });
    }

    // 2) Plan 테이블 업데이트
    await db.query(
      `UPDATE Plan SET description = ?, create_at = NOW() WHERE plan_id = ?`,
      [plan_text, plan_id]
    );

    // 3) Day 정보 추출 및 DailyPlan 생성
    const dayBlocks = plan_text.match(/Day\s*\d+\s*\([\d\-]+\)/g);

    if (!dayBlocks) {
      return res.status(500).json({ error: "Cannot detect daily plan blocks" });
    }

    const dailyIds = [];

    for (let i = 0; i < dayBlocks.length; i++) {
      const daily_id = `${plan_id}-day${String(i + 1).padStart(2, "0")}`;
      dailyIds.push(daily_id);

      await db.query(
        `INSERT INTO DailyPlan (daily_id, plan_id, title, create_at)
         VALUES (?, ?, ?, NOW())`,
        [
          daily_id,
          plan_id,
          dayBlocks[i]  // Day 제목 그대로 넣음
        ]
      );
    }

    // 4) Todo 저장
    for (let i = 0; i < todos.length; i++) {
      const t = todos[i];

      const todo_id = `${plan_id}-todo${String(i + 1).padStart(4, "0")}`;
      const daily_id = dailyIds[Math.floor(i / 4)]; // 1일당 4개 기준 (대부분 so)

      await db.query(
        `INSERT INTO Todo (todo_id, daily_id, title, content, status_id, end_time, accumulated_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          todo_id,
          daily_id,
          t.title,
          t.content,
          t.status_id,
          t.end_time,
          t.accumulated_time ?? 0
        ]
      );
    }

    return res.json({
      success: true,
      saved_daily: dailyIds.length,
      saved_todos: todos.length
    });

  } catch (err) {
    console.error("AI Save Error:", err);
    return res.status(500).json({ error: "AI Plan Save Failed" });
  }
};
