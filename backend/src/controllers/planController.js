// controllers/planController.js
const db = require("../db");

// ID 유틸
async function generatePlanId(userId) {
  const [rows] = await db.query(
    `SELECT plan_id FROM Plan WHERE user_id = ?
     ORDER BY plan_id DESC LIMIT 1`,
    [userId]
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const last = rows[0].plan_id.split("-").pop();
    nextSeq = parseInt(last) + 1;
  }
  return `${userId}-${String(nextSeq).padStart(4, "0")}`;
}

async function generateDailyId(planId) {
  const [rows] = await db.query(
    `SELECT daily_id FROM DailyPlan WHERE plan_id = ?
     ORDER BY daily_id DESC LIMIT 1`,
    [planId]
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const last = rows[0].daily_id.split("-").pop();
    nextSeq = parseInt(last) + 1;
  }
  return `${planId}-${String(nextSeq).padStart(4, "0")}`;
}

async function generateTodoId(dailyId) {
  const [rows] = await db.query(
    `SELECT todo_id FROM Todo WHERE daily_id = ?
     ORDER BY todo_id DESC LIMIT 1`,
    [dailyId]
  );

  let nextSeq = 1;
  if (rows.length > 0) {
    const last = rows[0].todo_id.split("-").pop();
    nextSeq = parseInt(last) + 1;
  }
  return `${dailyId}-${String(nextSeq).padStart(4, "0")}`;
}

const DEFAULT_TODO_STATUS = "NOT_STARTED";

// 1) Plan 목록
exports.getPlans = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id)
    return res.status(400).json({ message: "user_id 필요" });

  try {
    const [rows] = await db.query(
      `SELECT * FROM Plan WHERE user_id = ? ORDER BY create_at DESC`,
      [user_id]
    );
    res.json({ plans: rows });
  } catch (err) {
    console.error("Plan 목록 오류:", err);
    res.status(500).json({ message: "Plan 목록 조회 오류" });
  }
};

// 2) Plan 생성
exports.createPlan = async (req, res) => {
  try {
    const { user_id, title, description } = req.body;
    if (!user_id || !title) {
      return res.status(400).json({ message: "user_id, title 필요" });
    }

    const planId = await generatePlanId(user_id);

    await db.query(
      `INSERT INTO Plan
        (plan_id, user_id, title, description, start_date, end_date, create_at, is_ai_plan)
       VALUES (?, ?, ?, ?, NOW(), NULL, NOW(), false)`,
      [planId, user_id, title, description || null]
    );

    return res.json({ message: "플랜 생성됨", plan_id: planId });
  } catch (e) {
    console.error("플랜 생성 오류:", e);
    return res.status(500).json({ error: "플랜 생성 오류" });
  }
};

// 3) AI 계획 + Todos 저장 (PlanAI 화면에서 "이 계획으로 할게요")
exports.saveAiPlan = async (req, res) => {
  try {
    const { plan_id, session_id, todos, ai_plan_text } = req.body;

    if (!plan_id || !session_id || !Array.isArray(todos)) {
      return res.status(400).json({
        error: "plan_id, session_id, todos가 필요합니다.",
      });
    }

    // 0) Plan start_date 가져오기
    const [planRows] = await db.query(
      `SELECT start_date FROM Plan WHERE plan_id = ?`,
      [plan_id]
    );

    if (planRows.length === 0) {
      return res.status(400).json({ error: "해당 plan_id 없음" });
    }

    let planStartDate = planRows[0].start_date;

    // MySQL DATE는 JS Date 객체로 오므로, 로컬 YYYY-MM-DD로 변환
    if (planStartDate instanceof Date) {
      planStartDate =
        planStartDate.getFullYear() +
        "-" +
        String(planStartDate.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(planStartDate.getDate()).padStart(2, "0");
    }

    // 날짜 더하기 유틸
    function addDays(dateStr, days) {
      const [year, month, day] = dateStr.split("-").map(Number);

      const d = new Date(year, month - 1, day);
      d.setDate(d.getDate() + days);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      return `${yyyy}-${mm}-${dd}`;
    }

    let savedDailyIds = [];
    let savedTodoCount = 0;

    for (const dayBlock of todos) {
      const day = dayBlock.day;
      const dayTodos = dayBlock.todos || [];

      const currentDate = addDays(planStartDate, day - 1);

      const dailyId = await generateDailyId(plan_id);

      // DailyPlan 저장
      await db.query(
        `INSERT INTO DailyPlan
          (daily_id, plan_id, title, description, start_date, end_date, create_at, is_ai_plan)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), true)`,
        [
          dailyId,
          plan_id,
          `Day ${day}`,
          ai_plan_text || "",
          currentDate,
          currentDate,
        ]
      );

      savedDailyIds.push({
        day,
        daily_id: dailyId,
        date: currentDate,
      });

      // Todo 저장
      for (const t of dayTodos) {
        const todoId = await generateTodoId(dailyId);

        await db.query(
          `INSERT INTO Todo
            (todo_id, daily_id, title, content, status_id, end_time, accumulated_time)
          VALUES (?, ?, ?, ?, ?, NULL, ?)`,
          [
            todoId,
            dailyId,
            t.title,
            t.content,
            DEFAULT_TODO_STATUS,
            t.accumulated_time ?? 0,
          ]
        );

        savedTodoCount++;
      }
    }

    return res.json({
      success: true,
      saved_daily_count: savedDailyIds.length,
      saved_todo_count: savedTodoCount,
      daily_info: savedDailyIds,
    });

  } catch (e) {
    console.error("saveAiPlan Error:", e);
    return res.status(500).json({ error: "AI 계획 저장 중 오류" });
  }
};
