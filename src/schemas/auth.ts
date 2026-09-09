import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu phải dài ít nhất 8 ký tự"),
})

export type LoginFormValues = z.infer<typeof loginSchema>
