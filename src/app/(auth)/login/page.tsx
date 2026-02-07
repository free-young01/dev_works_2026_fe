"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/shared/ui/text-field/TextField";
import { AuthButton } from "@/shared/ui/auth-button/AuthButton";
import { Alert } from "@/shared/ui/alert/Alert";
import { login as loginApi } from "@/lib/api";
import { useAuth } from "@/features/auth/useAuth";
import { loginSchema, type LoginFormData } from "@/lib/auth.schemas";
import { getErrorMessage } from "@/lib/errorMessages";

/**
 * 로그인 페이지
 * ─────────────
 * react-hook-form + zod로 폼 검증 & 상태 관리
 */
export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ── 폼 제출 핸들러 ────────────────────────────────
  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await loginApi(data.email, data.password);

      // ───────────────────────────────────────────────
      // 에러 응답 처리
      // ───────────────────────────────────────────────
      if (!result.success) {
        // 이메일 인증 미완료 시 인증 페이지로 리다이렉트
        if (result.errorCode === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          return;
        }

        const errorMessage = getErrorMessage(result.errorCode || "UNKNOWN_ERROR");
        setFormError("root", { message: errorMessage });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">로그인</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            서강마켓에 오신 것을 환영합니다
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
                  {...field}
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
                  {...field}
                />
              )}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <AuthButton type="submit" loading={isSubmitting}>
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
