import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(6, "Пароль має бути не менше 6 символів"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Ім'я має бути не менше 2 символів"),
  email: z.string().email("Введіть коректний email"),
  password: z.string().min(6, "Пароль має бути не менше 6 символів"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;