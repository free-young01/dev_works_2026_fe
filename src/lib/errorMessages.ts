/**
 * Error Messages
 * ──────────────
 * API 에러 코드별 사용자 친화적 메시지 매핑
 */

type ErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_ALREADY_EXISTS"
  | "EMAIL_NOT_VERIFIED"
  | "USER_NOT_FOUND"
  | "INVALID_OR_EXPIRED_CODE"
  | "MISSING_FIELDS"
  | "UNKNOWN_ERROR";

/**
 * 에러 코드에 해당하는 한글 메시지 반환
 * @param errorCode API에서 받은 에러 코드
 * @returns 사용자에게 표시할 메시지
 */
export function getErrorMessage(errorCode: string): string {
  const messages: Record<ErrorCode, string> = {
    INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
    EMAIL_ALREADY_EXISTS: "이미 가입된 이메일입니다.",
    EMAIL_NOT_VERIFIED: "이메일 인증을 완료해주세요.",
    USER_NOT_FOUND: "존재하지 않는 계정입니다.",
    INVALID_OR_EXPIRED_CODE: "인증 코드가 유효하지 않거나 만료되었습니다.",
    MISSING_FIELDS: "모든 항목을 입력해주세요.",
    UNKNOWN_ERROR: "오류가 발생했습니다. 다시 시도해주세요.",
  };

  return messages[errorCode as ErrorCode] || messages.UNKNOWN_ERROR;
}
