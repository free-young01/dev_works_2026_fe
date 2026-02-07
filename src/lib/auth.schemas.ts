/**
 * Auth Schemas
 * ────────────
 * 로그인/회원가입/이메일 인증 폼 검증 스키마
 */

import { z } from "zod";

/**
 * 팀 validation base schema
 */
const emailSchema = z
  .string()
  .min(1, "이메일을 입력해주세요.")
  .email("올바른 이메일 형식이 아닙니다.")
  .transform((val) => val.trim());

const passwordSchema = z
  .string()
  .min(1, "비밀번호를 입력해주세요.")
  .min(8, "비밀번호는 8자 이상이어야 합니다.");

/**
 * 로그인 스키마
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * 회원가입 스키마
 */
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "비밀번호 확인을 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * 이메일 인증 스키마
 */
export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(1, "인증 코드를 입력해주세요.")
    .min(6, "인증 코드는 최소 6자 이상이어야 합니다."),
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
