import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { loginSchema, type LoginFormValues } from "@/schemas/auth"
import { useNavigate } from "react-router"
import { useAuthStore } from "@/stores/use-auth-store"
import { ShieldCheck, UserCircle, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"

export const Component = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  })
  const isFormDisabled = status === "loading" || form.formState.isSubmitting

  const onSubmit = async (credentials: LoginFormValues) => {
    try {
      const user = await login(credentials)
      if (user.role === "manager") {
        navigate("/dashboard", { replace: true })
      } else {
        navigate("/", { replace: true })
      }
    } catch {
      // The store exposes a user-facing error below the form.
    }
  }

  const setPresetAccount = (email: string) => {
    form.setValue("email", email)
    form.setValue("password", "password123")
  }

  return (
    <>
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-center text-xl font-semibold">Chào mừng trở lại</p>
        <p className="text-center text-sm text-muted-foreground">
          Đăng nhập hệ thống quản lý thư viện
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-lg border border-border/80 bg-muted/40 p-3 text-xs">
        <span className="font-medium text-foreground flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" /> Chọn nhanh tài khoản mẫu:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isFormDisabled}
            onClick={() => setPresetAccount("manager@library.com")}
            className="flex flex-col items-start rounded border border-border bg-background p-2 text-left hover:border-primary hover:bg-accent/50 transition-colors"
          >
            <span className="font-semibold text-primary flex items-center gap-1">
              <UserCircle className="size-3" /> Thủ thư / Quản lý
            </span>
            <span className="text-[11px] text-muted-foreground">manager@library.com</span>
          </button>
          <button
            type="button"
            disabled={isFormDisabled}
            onClick={() => setPresetAccount("reader@library.com")}
            className="flex flex-col items-start rounded border border-border bg-background p-2 text-left hover:border-primary hover:bg-accent/50 transition-colors"
          >
            <span className="font-semibold text-foreground flex items-center gap-1">
              <BookOpen className="size-3" /> Độc giả
            </span>
            <span className="text-[11px] text-muted-foreground">reader@library.com</span>
          </button>
        </div>
      </div>

      <form
        aria-busy={isFormDisabled}
        className="mt-4 flex w-full flex-col gap-3"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup className="gap-3">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field
                data-disabled={isFormDisabled}
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor="login-email">Email / Tên đăng nhập</FieldLabel>
                <InputGroup className="h-9 w-full">
                  <InputGroupInput
                    id="login-email"
                    aria-invalid={fieldState.invalid}
                    disabled={isFormDisabled}
                    autoComplete="username"
                    placeholder="Email đăng nhập"
                    type="email"
                    {...field}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field
                data-disabled={isFormDisabled}
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
                <PasswordInput
                  id="login-password"
                  aria-invalid={fieldState.invalid}
                  disabled={isFormDisabled}
                  autoComplete="current-password"
                  className="h-9 w-full"
                  placeholder="Mật khẩu (ít nhất 8 ký tự)"
                  {...field}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          className="w-full"
          type="submit"
          size="lg"
          disabled={isFormDisabled}
        >
          {form.formState.isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : null}
          Đăng nhập
        </Button>
      </form>
    </>
  )
}
