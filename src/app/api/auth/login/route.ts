import { NextRequest, NextResponse } from "next/server";
import { validateLogin } from "@/server/mockDb";
import { error, success } from "@/server/errors";

/**
 * POST /api/auth/login
 * ────────────────────
 * 요청 바디: { email: string; password: string }
 * 성공 응답: { success: true, accessToken: string }
 * 실패 응답: { success: false, errorCode: string, message: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. 필수 필드 확인
    if (!email || !password) {
      return NextResponse.json(error("MISSING_FIELDS"), { status: 400 });
    }

    // 2. 로그인 검증
    const user = validateLogin(email, password);
    if (!user) {
      return NextResponse.json(error("INVALID_CREDENTIALS"), { status: 401 });
    }

    // 3. (선택) 이메일 인증 여부 확인
    if (!user.isEmailVerified) {
      return NextResponse.json(error("EMAIL_NOT_VERIFIED"), { status: 403 });
    }

    // 4. Mock 토큰 발급
    const accessToken = `mock-token-${user.email}-${Date.now()}`;

    return NextResponse.json(
      { ...success(), accessToken },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(error("UNKNOWN_ERROR"), { status: 500 });
  }
}
