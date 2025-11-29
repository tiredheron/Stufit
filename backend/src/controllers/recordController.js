const db = require("../db");

// 기존 컨트롤러들 일부 재사용
const planController = require("./planController");
const todoController = require("./todoController");
const rankingController = require("./rankingController");

// 오늘 날짜 구하기
function todayStr() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

exports.getRecordSummary = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const mode = req.query.mode || "learning";
    const today = todayStr();

    // 1) 플랜 전체 트리 가져오기
    const [planRows] = await db.query(`
      SELECT 
        p.plan_id, p.title AS plan_title, p.description,
        d.daily_id, d.title AS daily_title,
        t.todo_id, t.title AS todo_title, t.content, t.accumulated_time, t.status_id
      FROM Plan p
      JOIN DailyPlan d ON p.plan_id = d.plan_id
      LEFT JOIN Todo t ON d.daily_id = t.daily_id
      WHERE p.user_id = ?
      ORDER BY p.create_at ASC, d.create_at ASC, t.todo_id ASC
    `, [userId]);

    // 조립 과정 (Controller > Service 구조로 빼도 되지만 지금은 단순하게)
    const planMap = new Map();

    for (const row of planRows) {
      if (!planMap.has(row.plan_id)) {
        planMap.set(row.plan_id, {
          plan_id: row.plan_id,
          title: row.plan_title,
          description: row.description,
          dailyPlans: []
        });
      }

      const p = planMap.get(row.plan_id);
      let daily = p.dailyPlans.find(d => d.daily_id === row.daily_id);

      if (!daily) {
        daily = {
          daily_id: row.daily_id,
          title: row.daily_title,
          todos: []
        };
        p.dailyPlans.push(daily);
      }

      if (row.todo_id) {
        daily.todos.push({
          todo_id: row.todo_id,
          title: row.todo_title,
          content: row.content,
          accumulated_time: row.accumulated_time,
          status_id: row.status_id,
        });
      }
    }

    const plans = Array.from(planMap.values());

    // 2) 오늘 공부 시간
    const [todayTodos] = await db.query(`
      SELECT accumulated_time 
      FROM Todo t
      JOIN DailyPlan d ON t.daily_id = d.daily_id
      JOIN Plan p ON d.plan_id = p.plan_id
      WHERE p.user_id = ?
      AND ? BETWEEN d.start_date AND d.end_date
    `, [userId, today]);

    const todayTime = todayTodos.reduce(
      (sum, row) => sum + (row.accumulated_time || 0), 0
    );

    // 3) 개인 랭킹
    const [personal] = await db.query(`
      SELECT myRank FROM RankingPersonal WHERE user_id = ?
    `, [userId]);

    // 4) 학과 랭킹
    const [dept] = await db.query(`
      SELECT myDepartmentRank FROM RankingDepartment WHERE user_id = ?
    `, [userId]);

    return res.json({
      userId,
      summary: {
        todayTime,
        overallRank: personal?.[0]?.myRank || 0,
        majorRank: dept?.[0]?.myDepartmentRank || 0,
      },
      plans
    });

  } catch (err) {
    console.error("record summary error:", err);
    return res.status(500).json({ message: "record summary error" });
  }
};
