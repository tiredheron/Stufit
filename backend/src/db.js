const mysql = require("mysql2/promise");
require("dotenv").config();

// ---------- 풀 생성 ----------
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 15000,       // 연결 시도 최대 15초
  acquireTimeout: 15000,       // pool connection 획득 최대 15초
  enableKeepAlive: true,       // KeepAlive 활성화
  keepAliveInitialDelay: 0     // 즉시 keepalive 시작
});

// ---------- 세션 설정 (MySQL 타임아웃 증가) ----------
pool.on("connection", (connection) => {
  console.log("DB connection 생성합니다.");

  connection.query("SET SESSION wait_timeout=28800");
  connection.query("SET SESSION interactive_timeout=28800");
  connection.query("SET SESSION net_read_timeout=600");
  connection.query("SET SESSION net_write_timeout=600");
  connection.query("SET SESSION innodb_lock_wait_timeout=200");
});

// ---------- 쿼리 오토-리커넥트 wrapper ----------
async function query(sql, params) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    if (
      err.code === "PROTOCOL_CONNECTION_LOST" ||
      err.code === "ER_NET_READ_INTERRUPTED" ||
      err.fatal
    ) {
      console.warn("⚠ DB connection lost. Retrying…");
      return await pool.query(sql, params); // 재시도
    }
    throw err;
  }
}

module.exports = { pool, query };
