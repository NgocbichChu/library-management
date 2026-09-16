import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router"
import { useAuth } from "@/hooks/use-auth"
import { loginSchema, type LoginFormValues } from "@/schemas/auth"

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
  const location = useLocation()
  const { login, status, error, clearError } = useAuth()

  const form = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  })

  const isFormDisabled = status === "loading" || form.formState.isSubmitting

  const onSubmit = async (credentials: LoginFormValues) => {
    try {
      await login(credentials)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? "/profile", { replace: true })
    } catch {
      // The store exposes a user-facing error message below the form.
    }
  }

  const handleFillDemo = () => {
    form.setValue("username", "admin239", { shouldValidate: true })
    form.setValue("password", "12345678", { shouldValidate: true })
    clearError()
  }

  return (
    <>
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1f3b2b]">
          Đăng nhập
        </h1>
        <p className="text-sm text-[#718077]">
          Nhập tài khoản để quản lý thẻ và mượn sách
        </p>
      </div>

      <form
        aria-busy={isFormDisabled}
        className="mt-6 flex w-full flex-col gap-4"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FieldGroup className="gap-3.5">
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <Field
                data-disabled={isFormDisabled}
                data-invalid={fieldState.invalid}
              >
                <FieldLabel
                  htmlFor="login-username"
                  className="text-xs font-semibold tracking-wider text-[#56675c] uppercase"
                >
                  Tên đăng nhập
                </FieldLabel>
                <InputGroup className="h-10 w-full rounded-lg border-[#cbd8ce] bg-[#fbfcfa] transition-colors focus-within:border-[#1f5a45]">
                  <InputGroupInput
                    id="login-username"
                    aria-invalid={fieldState.invalid}
                    disabled={isFormDisabled}
                    autoComplete="username"
                    placeholder="Ví dụ: admin239"
                    className="h-10"
                    {...field}
                    onChange={(event) => {
                      if (error) clearError()
                      field.onChange(event)
                    }}
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
                <FieldLabel
                  htmlFor="login-password"
                  className="text-xs font-semibold tracking-wider text-[#56675c] uppercase"
                >
                  Mật khẩu
                </FieldLabel>
                <PasswordInput
                  id="login-password"
                  aria-invalid={fieldState.invalid}
                  disabled={isFormDisabled}
                  autoComplete="current-password"
                  className="h-10 w-full rounded-lg border-[#cbd8ce] bg-[#fbfcfa] transition-colors focus-within:border-[#1f5a45]"
                  placeholder="Nhập mật khẩu"
                  {...field}
                  onChange={(event) => {
                    if (error) clearError()
                    field.onChange(event)
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-[#f2d6d3] bg-[#fdf3f2] p-3 text-sm text-[#b43428]"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p className="leading-snug">{error}</p>
          </div>
        ) : null}

        <Button
          className="mt-2 h-10 w-full bg-[#1f5a45] font-medium text-white transition-colors hover:bg-[#174735]"
          type="submit"
          size="lg"
          disabled={isFormDisabled}
        >
          {form.formState.isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : null}
          Đăng nhập
        </Button>

        <div className="rounded-xl border border-dashed border-[#cbd8ce] bg-[#f7f8f4] p-3 text-xs text-[#617067]">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#24382b]">
              Tài khoản thử nghiệm:
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="font-semibold text-[#1f5a45] hover:underline"
            >
              Điền nhanh
            </button>
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-[#4a574f]">
            <span>admin239</span>
            <span>/</span>
            <span>12345678</span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#718077] transition-colors hover:text-[#1f5a45]"
          >
            <ArrowLeft className="size-3.5" /> Quay lại trang chủ
          </Link>
        </div>
      </form>
    </>
  )
}
