const db = require("../db");

/**
 * 시간을 "XXh XXm" 형식으로 변환
 */
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * 학과 내 개인 순위 조회
 * GET /ranking/personal?user_id=xxx
 */
exports.getPersonalRanking = async (req, res) => {
  const { user_id } = req.query;

  console.log("=== getPersonalRanking 요청 ===");
  console.log("user_id:", user_id);

  if (!user_id) {
    return res.status(400).json({ message: "user_id는 필수입니다." });
  }

  try {
    // 1. 해당 사용자의 학과 정보 가져오기
    const [userInfo] = await db.query(
      "SELECT department_name, university_name FROM user WHERE user_id = ?",
      [user_id]
    );

    if (userInfo.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const { department_name } = userInfo[0];

    // 2. 같은 학과 학생들의 이번 주 학습 시간 계산
    const sql = `
      SELECT 
        u.user_id,
        u.department_name,
        -- 이번 주 총 학습 시간 (분 단위)
        COALESCE(SUM(CASE 
          WHEN YEARWEEK(t.end_time, 1) = YEARWEEK(CURDATE(), 1) 
            AND t.status_id = 'DONE'
          THEN t.accumulated_time 
          ELSE 0 
        END), 0) as current_week_minutes,
        -- 지난 주 총 학습 시간 (분 단위)
        COALESCE(SUM(CASE 
          WHEN YEARWEEK(t.end_time, 1) = YEARWEEK(CURDATE(), 1) - 1 
            AND t.status_id = 'DONE'
          THEN t.accumulated_time 
          ELSE 0 
        END), 0) as last_week_minutes
      FROM user u
      LEFT JOIN Plan p ON u.user_id = p.user_id
      LEFT JOIN DailyPlan dp ON p.plan_id = dp.plan_id
      LEFT JOIN Todo t ON dp.daily_id = t.daily_id
      WHERE u.department_name = ?
      GROUP BY u.user_id, u.department_name
      HAVING current_week_minutes > 0 OR last_week_minutes > 0
      ORDER BY current_week_minutes DESC
    `;

    const [rankings] = await db.query(sql, [department_name]);

    // 3. 순위 매기기 및 포맷팅
    const formattedRankings = rankings.map((row, index) => {
      const weeklyIncrease = row.current_week_minutes - row.last_week_minutes;
      
      return {
        rank: index + 1,
        user_id: row.user_id,
        department: row.department_name,
        studyTime: formatTime(row.current_week_minutes),
        studyTimeMinutes: row.current_week_minutes,
        weeklyIncrease: weeklyIncrease >= 0 ? `+${formatTime(weeklyIncrease)}` : `-${formatTime(Math.abs(weeklyIncrease))}`,
        weeklyIncreaseMinutes: weeklyIncrease,
        isMe: row.user_id === user_id
      };
    });

    // 4. 내 순위 찾기
    const myRanking = formattedRankings.find(r => r.isMe);
    const myRank = myRanking ? myRanking.rank : null;
    const totalStudents = formattedRankings.length;

    return res.json({
      myRank,
      totalStudents,
      department: department_name,
      myStudyTime: myRanking ? myRanking.studyTime : "0h 0m",
      rankings: formattedRankings
    });

  } catch (err) {
    console.error("=== 에러 발생 ===");
    console.error("에러 메시지:", err.message);
    console.error("전체 에러:", err);
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};

/**
 * 학과별 순위 조회
 * GET /ranking/department?user_id=xxx
 */
exports.getDepartmentRanking = async (req, res) => {
  const { user_id } = req.query;

  console.log("=== getDepartmentRanking 요청 ===");
  console.log("user_id:", user_id);

  if (!user_id) {
    return res.status(400).json({ message: "user_id는 필수입니다." });
  }

  try {
    // 1. 해당 사용자의 학과 정보 가져오기
    const [userInfo] = await db.query(
      "SELECT department_name FROM user WHERE user_id = ?",
      [user_id]
    );

    if (userInfo.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const { department_name: myDepartment } = userInfo[0];

    // 2. 학과별 통계 계산
    const sql = `
      SELECT 
        u.department_name,
        COUNT(DISTINCT u.user_id) as student_count,
        -- 이번 주 학과 전체 학습 시간 (분 단위)
        COALESCE(SUM(CASE 
          WHEN YEARWEEK(t.end_time, 1) = YEARWEEK(CURDATE(), 1) 
            AND t.status_id = 'DONE'
          THEN t.accumulated_time 
          ELSE 0 
        END), 0) as total_study_minutes
      FROM user u
      LEFT JOIN Plan p ON u.user_id = p.user_id
      LEFT JOIN DailyPlan dp ON p.plan_id = dp.plan_id
      LEFT JOIN Todo t ON dp.daily_id = t.daily_id
      GROUP BY u.department_name
      HAVING total_study_minutes > 0
      ORDER BY total_study_minutes DESC
    `;

    const [rankings] = await db.query(sql);

    // 3. 순위 매기기 및 포맷팅
    const formattedRankings = rankings.map((row, index) => {
      const avgMinutes = Math.floor(row.total_study_minutes / row.student_count);
      
      return {
        rank: index + 1,
        department: row.department_name,
        totalStudyTime: formatTime(row.total_study_minutes),
        totalStudyMinutes: row.total_study_minutes,
        avgPerStudent: formatTime(avgMinutes),
        avgPerStudentMinutes: avgMinutes,
        studentCount: row.student_count,
        isMyDepartment: row.department_name === myDepartment
      };
    });

    // 4. 내 학과 순위 찾기
    const myDeptRanking = formattedRankings.find(r => r.isMyDepartment);
    const myDeptRank = myDeptRanking ? myDeptRanking.rank : null;

    return res.json({
      myDepartmentRank: myDeptRank,
      myDepartment,
      myDepartmentTotalTime: myDeptRanking ? myDeptRanking.totalStudyTime : "0h 0m",
      rankings: formattedRankings
    });

  } catch (err) {
    console.error("=== 에러 발생 ===");
    console.error("에러 메시지:", err.message);
    console.error("전체 에러:", err);
    return res.status(500).json({ message: "서버 오류", error: err.message });
  }
};
