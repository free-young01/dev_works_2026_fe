/**
 * Mock Database (메모리 스토어)
 * ─────────────────────────────
 * Route Handler 간에 상태를 공유하기 위한 인-메모리 저장소입니다.
 * 서버가 재시작되면 데이터가 초기화됩니다.
 */

// ── 타입 정의 ──────────────────────────────────────────
export interface User {
  email: string;
  password: string; // 실서비스에서는 반드시 해시! 여기서는 plain text
  isEmailVerified: boolean;
  createdAt: number;
}

export interface VerificationCode {
  code: string;
  expiresAt: number; // Unix ms
}

// ── 스토어 ─────────────────────────────────────────────
const users: User[] = [];
const verificationCodes: Map<string, VerificationCode> = new Map();

// ── 유저 관련 ──────────────────────────────────────────

/** 이메일로 유저 검색 */
export function findUser(email: string): User | undefined {
  const trimmedEmail = email.trim();
  return users.find((u) => u.email === trimmedEmail);
}

/** 새 유저 생성 — 이미 존재하면 null 반환 */
export function createUser(email: string, password: string): User | null {
  const trimmedEmail = email.trim();
  if (findUser(trimmedEmail)) return null;

  const user: User = {
    email: trimmedEmail,
    password,
    isEmailVerified: false,
    createdAt: Date.now(),
  };
  users.push(user);
  return user;
}

/** 로그인 검증 — 이메일/비밀번호 매칭 */
export function validateLogin(
  email: string,
  password: string,
): User | null {
  const trimmedEmail = email.trim();
  const user = findUser(trimmedEmail);
  if (!user) return null;
  if (user.password !== password) return null;
  return user;
}

/** 이메일 인증 완료 처리 */
export function markEmailVerified(email: string): boolean {
  const trimmedEmail = email.trim();
  const user = findUser(trimmedEmail);
  if (!user) return false;
  user.isEmailVerified = true;
  return true;
}

// ── 이메일 인증 코드 관련 ──────────────────────────────

const CODE_TTL_MS = 5 * 60 * 1000; // 5분

/**
 * 인증 코드 발급
 * (행사용이므로 고정 코드 "123456")
 */
export function issueCode(email: string): string {
  const trimmedEmail = email.trim();
  const code = "123456";
  verificationCodes.set(trimmedEmail, {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
  });
  return code;
}

/** 인증 코드 검증 */
export function verifyCode(email: string, code: string): boolean {
  const trimmedEmail = email.trim();
  const entry = verificationCodes.get(trimmedEmail);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    verificationCodes.delete(trimmedEmail);
    return false;
  }
  if (entry.code !== code) return false;

  // 성공 시 코드 삭제 & 이메일 인증 마킹
  verificationCodes.delete(trimmedEmail);
  markEmailVerified(trimmedEmail);
  return true;
}

// ── 디버그용 (precheck 페이지에서 사용) ────────────────
export function getAllUsers(): Omit<User, "password">[] {
  return users.map(({ password: _, ...rest }) => rest);
}

export function resetAll(): void {
  users.length = 0;
  verificationCodes.clear();
}
