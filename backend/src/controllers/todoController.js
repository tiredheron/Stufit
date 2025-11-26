const db = require("../db");

// GET /todo/list?user_id=xxx&date=YYYY-MM-DD
exports.getTodoList = async (req, res) => {
  const { user_id, date } = req.query;

  console.log("=== getTodoList 요청 ===");
  console.log("user_id:", user_id);
  console.log("date:", date);

  if (!user_id || !date) {
    return res
      .status(400)
      .json({ message: "user_id와 date(YYYY-MM-DD)는 필수입니다." });
  }

  try {
    const sql = `
      SELECT 
        t.todo_id,
        t.title,
        t.content,
        t.end_time,
        t.accumulated_time,
        t.status_id,
        s.status_name,
        d.daily_id,
        d.title as daily_title
      FROM Todo t
      JOIN DailyPlan d ON t.daily_id = d.daily_id
      JOIN Plan p ON d.plan_id = p.plan_id
      JOIN TodoStatus s ON t.status_id = s.status_id
      WHERE p.user_id = ?
      AND ? BETWEEN d.start_date AND d.end_date
      ORDER BY t.end_time ASC
    `;

    console.log("실행할 SQL:", sql);
    console.log("파라미터:", [user_id, date]);

    const [rows] = await db.query(sql, [user_id, date]);

    return res.json({
      todos: rows,
    });
  } catch (err) {
    console.error("=== 에러 발생 ===");
    console.error("에러 메시지:", err.message);
    console.error("전체 에러:", err);
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};
