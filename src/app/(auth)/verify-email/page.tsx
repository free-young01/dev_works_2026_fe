"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/shared/ui/text-field/TextField";
import { AuthButton } from "@/shared/ui/auth-button/AuthButton";
import { Alert } from "@/shared/ui/alert/Alert";
import { sendEmailCode, verifyEmailCode } from "@/lib/api";
import { verifyEmailSchema, type VerifyEmailFormData } from "@/lib/auth.schemas";
import { getErrorMessage } from "@/lib/errorMessages";

/**
 * 이메일 인증 페이지 (선택 기능)
 * ──────────────────────────────
 * 회원가입 후 이메일 인증 코드를 입력하는 페이지입니다.
 * URL: /verify-email?email=user@example.com
 *
 * (행사용) 인증 코드는 항상 "123456" 입니다.
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      }>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";

  // ── form 상태 ────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    reset,
    control,
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onBlur",
    defaultValues: {
      code: "",
    },
  });

  // ── UI 상태 ────────────────────────────────────
  const [success, setSuccess] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // 재발송 타이머

  // ── 타이머 이펙트 ────────────────────────────────
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // ── 인증 코드 발송 ────────────────────────────────
  const handleSendCode = async () => {
    setSuccess(null);
    setFormError("root", {});

    try {
      const result = await sendEmailCode(email.trim());

      if (!result.success) {
        const errorMessage = getErrorMessage(result.errorCode || "UNKNOWN_ERROR");
        setFormError("root", { message: errorMessage });
        return;
      }

      setCodeSent(true);
      setSuccess("인증 코드가 발송되었습니다.");
      setTimeLeft(60); // 60초 타이머 시작
    } catch {
      setFormError("root", {
        message: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }
  };

  // ── 인증 코드 검증 ────────────────────────────────
  const onSubmit = async (data: VerifyEmailFormData) => {
    setSuccess(null);

    try {
      const result = await verifyEmailCode(email.trim(), data.code);

      if (!result.success) {
        const errorMessage = getErrorMessage(result.errorCode || "UNKNOWN_ERROR");
        setFormError("root", { message: errorMessage });
        return;
      }

      setSuccess("이메일 인증이 완료되었습니다!");

      // 1초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch {
      setFormError("root", {
        message: "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-1000">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm dark:bg-gray-900">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">이메일 인증</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-sogang-700">{email}</span>
            <br />
            으로 발송된 인증 코드를 입력해주세요
          </p>
          <p className="mt-1 text-xs text-gray-500">
            (행사용 힌트: 인증 코드는 <strong>123456</strong> 입니다)
          </p>
        </div>

        {/* 알림 */}
        <Alert message={errors.root?.message || null} variant="error" />
        <Alert message={success} variant="success" />

        {/* 코드 발송 버튼 */}
        {!codeSent && (
          <AuthButton onClick={handleSendCode} loading={isSubmitting}>
            인증 코드 발송
          </AuthButton>
        )}

        {/* 코드 입력 폼 */}
        {codeSent && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="인증 코드"
                    type="text"
                    placeholder="6자리 코드 입력"
                    {...field}
                  />
                )}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            <AuthButton type="submit" loading={isSubmitting}>
              인증 확인
            </AuthButton>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={timeLeft > 0 || isSubmitting}
              className={`w-full text-center text-sm ${
                timeLeft > 0
                  ? "cursor-not-allowed text-gray-400"
                  : "text-gray-600 hover:text-sogang-700 dark:text-gray-400"
              }`}>
              {timeLeft > 0 ? `코드 재발송 (${timeLeft}초)` : "코드 재발송"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
