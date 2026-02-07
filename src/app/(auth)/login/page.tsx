"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField } from "@/shared/ui/text-field/TextField";
import { AuthButton } from "@/shared/ui/auth-button/AuthButton";
import { Alert } from "@/shared/ui/alert/Alert";
import { login as loginApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { validateEmail, validatePassword } from "@/shared/lib/validators";
import { getErrorMessage } from "@/lib/errorMessages";

/**
 * 로그인 페이지
 * ─────────────
 * 기본 폼 UI가 갖춰져 있습니다.
 * 아래 TODO 들을 완성해 주세요!
 */
export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  // ── 폼 상태 ────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ── UI 상태 ────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── 폼 제출 핸들러 ────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // ─────────────────────────────────────────────────
    // Validation
    // ─────────────────────────────────────────────────
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || "이메일을 입력해주세요.");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || "비밀번호를 입력해주세요.");
      return;
    }

    // ─────────────────────────────────────────────────
    // 로딩 상태 처리
    // ─────────────────────────────────────────────────
    setLoading(true);

    try {
      const result = await loginApi(email, password);

      // ───────────────────────────────────────────────
      // 에러 응답 처리
      // ───────────────────────────────────────────────
      if (!result.success) {
        const errorMessage = getErrorMessage(result.errorCode || "UNKNOWN_ERROR");
        setError(errorMessage);
        return;
      }

      // ───────────────────────────────────────────────
      // 로그인 성공 처리
      // ───────────────────────────────────────────────
      if ("accessToken" in result) {
        authLogin(result.accessToken);
        router.push("/main");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-1000">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">로그인</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            서강마켓에 오신 것을 환영합니다
          </p>
        </div>

        {/* 에러 알림 */}
        <Alert message={error} variant="error" />

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            label="이메일"
            type="email"
            placeholder="you@sogang.ac.kr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="비밀번호"
            type="password"
            placeholder="8자 이상 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <AuthButton type="submit" loading={loading}>
            로그인
          </AuthButton>
        </form>

        {/* 하단 링크 */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-medium text-sogang-700 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
