// src/controllers/chatController.js
const db = require("../db");

// chat_id 생성 ("plan01-chat0001")
async function generateChatId(plan_id) {
  const [rows] = await db.query(
    `SELECT chat_id 
     FROM AiChat 
     WHERE plan_id = ?
     ORDER BY created_at DESC, chat_id DESC
     LIMIT 1`,
    [plan_id]
  );

  let nextSeq = 1;

  if (rows.length > 0) {
    const lastId = rows[0].chat_id;              // ex: susom02-0001-chat0004
    const num = parseInt(lastId.split("-chat")[1], 10);
    nextSeq = num + 1;
  }

  const padded = String(nextSeq).padStart(4, "0");
  return `${plan_id}-chat${padded}`;
}

/* ---------------------------------------------------------
   채팅 저장
--------------------------------------------------------- */
exports.saveChat = async (req, res) => {
  try {
    const { plan_id, role, message, file_name } = req.body;

    if (!plan_id || !role || !message) {
      return res.status(400).json({ error: "plan_id, role, message는 필수입니다." });
    }

    const chat_id = await generateChatId(plan_id);

    await db.query(
      `INSERT INTO AiChat (chat_id, plan_id, role, message, file_name, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [chat_id, plan_id, role, message, file_name || null]
    );

    res.json({ success: true, chat_id });
  } catch (error) {
    console.error("Chat save error:", error);
    res.status(500).json({ error: "Chat save failed" });
  }
};

/* ---------------------------------------------------------
   특정 플랜의 채팅 조회
--------------------------------------------------------- */
exports.getChatByPlanId = async (req, res) => {
  try {
    const { plan_id } = req.params;

    const [rows] = await db.query(
      `SELECT chat_id, plan_id, role, message, file_name, created_at
       FROM AiChat
       WHERE plan_id = ?
       ORDER BY created_at ASC, chat_id ASC`,
      [plan_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Chat load error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
