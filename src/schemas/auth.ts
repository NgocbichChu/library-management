import { z } from "zod"

export const loginSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải dài ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải dài ít nhất 6 ký tự"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
