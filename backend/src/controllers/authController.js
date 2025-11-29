const db = require("../db");
const bcrypt = require("bcryptjs");

// 회원가입에 대한 함수
exports.registerUser = async (req, res) => {
  const { user_id, password, university_name, department_name } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호는 필수입니다." });
  }

  try {
    // 아이디 중복 확인
    const [user] = await db.query(
      "SELECT * FROM user WHERE user_id = ?",
      [user_id]
    );

    if (user.length > 0) {
      return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
    }

    // 비밀번호 암호화
    const hashedPw = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO user (user_id, password, university_name, department_name) VALUES (?, ?, ?, ?)",
      [user_id, hashedPw, university_name, department_name]
    );

    res.status(201).json({ message: "회원가입 성공" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 로그인 부분에 대한 함수
exports.loginUser = async (req, res) => {
  const { user_id, password } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM user WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "존재하지 않는 아이디입니다." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    res.status(200).json({
      message: "로그인 성공",
      user_id: user.user_id,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 사용자 정보 조회
exports.getUserInfo = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "user_id가 필요합니다." });
  }

  try {
    const [rows] = await db.query(
      "SELECT user_id, university_name, department_name FROM user WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

// 프로필 편집 중 학교명과 학과명을 수정할 수 있게 해주는 함수
exports.updateProfile = async (req, res) => {
  const { user_id, university_name, department_name } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "user_id가 필요합니다." });
  }

  try {
    await db.query(
      "UPDATE user SET university_name = ?, department_name = ? WHERE user_id = ?",
      [university_name, department_name, user_id]
    );

    res.status(200).json({ message: "프로필 수정 완료" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

// 프로필 편집 중 비밀번호 변경에 대한 함수
exports.updatePassword = async (req, res) => {
  const { user_id, old_password, new_password, confirm_password } = req.body;

  if (!old_password || !new_password || !confirm_password) {
    return res.status(400).json({ message: "모든 비밀번호 항목을 입력해주세요." });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({ message: "새 비밀번호가 서로 일치하지 않습니다." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM user WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "유저를 찾을 수 없습니다." });
    }

    const user = rows[0];

    // 기존 비밀번호 비교
    const isMatch = await bcrypt.compare(old_password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "기존 비밀번호가 일치하지 않습니다." });
    }

    // 새 비밀번호 암호화
    const hashedPw = await bcrypt.hash(new_password, 10);

    await db.query(
      "UPDATE user SET password = ? WHERE user_id = ?",
      [hashedPw, user_id]
    );

    res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "서버 오류" });
  }
};

