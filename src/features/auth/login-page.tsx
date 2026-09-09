import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { loginSchema, type LoginFormValues } from "@/schemas/auth"
import { useNavigate } from "react-router"
import { useAuthStore } from "@/stores/use-auth-store"

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
      await login(credentials)
      navigate("/dashboard", { replace: true })
    } catch {
      // The store exposes a user-facing error below the form.
    }
  }

  return (
    <>
      <div className="mt-4 flex flex-col gap-1">
        <p className="text-center text-xl font-semibold">Chào mừng trở lại</p>
        <p className="text-center text-sm text-muted-foreground">
          Đăng nhập để quản lý thư viện
        </p>
      </div>
      <form
        aria-busy={isFormDisabled}
        className="mt-6 flex w-full flex-col gap-3"
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
                <FieldLabel htmlFor="login-email">Email</FieldLabel>
                <InputGroup className="h-9 w-full">
                  <InputGroupInput
                    id="login-email"
                    aria-invalid={fieldState.invalid}
                    disabled={isFormDisabled}
                    autoComplete="username"
                    placeholder="Email"
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
                  placeholder="Mật khẩu"
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
