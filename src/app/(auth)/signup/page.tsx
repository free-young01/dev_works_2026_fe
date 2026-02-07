"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/shared/ui/text-field/TextField";
import { AuthButton } from "@/shared/ui/auth-button/AuthButton";
import { Alert } from "@/shared/ui/alert/Alert";
import { signup as signupApi } from "@/lib/api";
import { signupSchema, type SignupFormData } from "@/lib/auth.schemas";
import { getErrorMessage } from "@/lib/errorMessages";

/**
 * 회원가입 페이지
 * ──────────────
 * react-hook-form + zod로 폼 검증 & 상태 관리
 */
export default function SignupPage() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ── 폼 제출 핸들러 ────────────────────────────────
  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await signupApi(data.email, data.password);

      // ───────────────────────────────────────────────
      // 에러 응답 처리
      // ───────────────────────────────────────────────
      if (!result.success) {
        const errorMessage = getErrorMessage(result.errorCode || "UNKNOWN_ERROR");
        setFormError("root", { message: errorMessage });
        return;
      }

      // ───────────────────────────────────────────────
      // 회원가입 성공 처리
      // ───────────────────────────────────────────────
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">회원가입</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            서강마켓에 가입하고 거래를 시작하세요
          </p>
        </div>

        {/* 에러 알림 */}
        <Alert message={errors.root?.message || null} variant="error" />

        {/* 폼 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  label="이메일"
                  type="email"
                  placeholder="you@sogang.ac.kr"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  label="비밀번호"
                  type="password"
                  placeholder="8자 이상 입력"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  label="비밀번호 확인"
                  type="password"
                  placeholder="비밀번호를 다시 입력"
                  value={field.value || ""}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <AuthButton type="submit" loading={isSubmitting}>
            회원가입
          </AuthButton>
        </form>

        {/* 하단 링크 */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-medium text-sogang-700 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
