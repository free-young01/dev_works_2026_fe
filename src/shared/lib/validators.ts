/**
 * Validators
 * ──────────
 * 로그인/회원가입 폼 입력값 검증 유틸
 */

/**
 * 이메일 형식 검증
 * @param email 검증할 이메일
 * @returns { isValid: boolean, error?: string }
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email.trim()) {
    return { isValid: false, error: "이메일을 입력해주세요." };
  }

  // 기본적인 이메일 형식 검증 (RFC 5322 간소화)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "올바른 이메일 형식이 아닙니다." };
  }

  return { isValid: true };
}

/**
 * 비밀번호 검증 (8자 이상)
 * @param password 검증할 비밀번호
 * @returns { isValid: boolean, error?: string }
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: "비밀번호를 입력해주세요." };
  }

  if (password.length < 8) {
    return { isValid: false, error: "비밀번호는 8자 이상이어야 합니다." };
  }

  return { isValid: true };
}

/**
 * 비밀번호 확인 검증 (일치 여부)
 * @param password 비밀번호
 * @param confirmPassword 비밀번호 확인
 * @returns { isValid: boolean, error?: string }
 */
export function validatePasswordConfirm(
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } {
  if (!confirmPassword) {
    return { isValid: false, error: "비밀번호 확인을 입력해주세요." };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: "비밀번호가 일치하지 않습니다." };
  }

  return { isValid: true };
}
