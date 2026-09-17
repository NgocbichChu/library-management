import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, ArrowLeft, UserPlus } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router"
import { toast } from "sonner"
import { useAuth } from "@/hooks/use-auth"
import { loginSchema, type LoginFormValues } from "@/schemas/auth"
import { authService } from "@/services/auth"

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
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  // Register form state
  const [regUsername, setRegUsername] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regFullName, setRegFullName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regAddress, setRegAddress] = useState("")
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    defaultValues: {
      username: "admin",
      password: "123456",
    },
    resolver: zodResolver(loginSchema),
  })

  const isFormDisabled = status === "loading" || form.formState.isSubmitting

  const onSubmit = async (credentials: LoginFormValues) => {
    try {
      const user = await login(credentials)
      const isManagerRole = user.roles?.some((r) =>
        ["ADMIN", "LIBRARIAN", "EMPLOYEE"].includes(r.toUpperCase())
      )
      const from = (location.state as { from?: string } | null)?.from
      if (from) {
        navigate(from, { replace: true })
      } else if (isManagerRole) {
        navigate("/dashboard", { replace: true })
      } else {
        navigate("/profile", { replace: true })
      }
    } catch {
      // The store exposes a user-facing error message below the form.
    }
  }

  const handleFillAccount = (username: string, password = "123456") => {
    form.setValue("username", username, { shouldValidate: true })
    form.setValue("password", password, { shouldValidate: true })
    clearError()
  }

  const handleRegisterReader = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regUsername.trim() || !regPassword.trim()) {
      setRegError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.")
      return
    }
    setRegLoading(true)
    setRegError(null)
    try {
      await authService.registerReader({
        username: regUsername.trim(),
        password: regPassword,
        fullName: regFullName.trim() || undefined,
        email: regEmail.trim() || undefined,
        phoneNumber: regPhone.trim() || undefined,
        address: regAddress.trim() || undefined,
      })
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.")
      form.setValue("username", regUsername.trim())
      form.setValue("password", regPassword)
      setActiveTab("login")
    } catch (err: unknown) {
      setRegError(
        err instanceof Error
          ? err.message
          : "Đăng ký thất bại. Vui lòng thử lại."
      )
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1f3b2b]">
          {activeTab === "login" ? "Đăng nhập" : "Đăng ký Độc giả"}
        </h1>
        <p className="text-sm text-[#718077]">
          {activeTab === "login"
            ? "Nhập tài khoản để quản lý thẻ và mượn sách"
            : "Tạo tài khoản độc giả mới để tra cứu và mượn sách"}
        </p>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex rounded-lg bg-[#eef4ee] p-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login")
            clearError()
          }}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
            activeTab === "login"
              ? "bg-white text-[#1f3b2b] shadow-xs"
              : "text-[#627768] hover:text-[#1f3b2b]"
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("register")
            setRegError(null)
          }}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
            activeTab === "register"
              ? "bg-white text-[#1f3b2b] shadow-xs"
              : "text-[#627768] hover:text-[#1f3b2b]"
          }`}
        >
          Đăng ký Độc giả
        </button>
      </div>

      {activeTab === "login" ? (
        <form
          aria-busy={isFormDisabled}
          className="mt-4 flex w-full flex-col gap-4"
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
                      placeholder="Ví dụ: admin"
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

          <div className="rounded-xl border border-dashed border-[#cbd8ce] bg-[#f7f8f4] p-3.5 text-xs text-[#617067]">
            <p className="font-medium text-[#24382b]">
              Tài khoản thử nghiệm hệ thống:
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleFillAccount("admin", "123456")}
                className="rounded-lg border border-[#1f5a45] bg-[#eef5ee] px-2 py-1.5 text-center transition-colors hover:bg-[#dfeade]"
              >
                <span className="block font-semibold text-[#1f5a45]">
                  Admin
                </span>
                <span className="block font-mono text-[10px] text-[#4a6353]">
                  admin
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleFillAccount("thuthu", "123456")}
                className="rounded-lg border border-[#cbd8ce] bg-white px-2 py-1.5 text-center transition-colors hover:border-[#1f5a45] hover:bg-[#e7eee3]"
              >
                <span className="block font-semibold text-[#2d5a3f]">
                  Thủ thư
                </span>
                <span className="block font-mono text-[10px] text-[#718077]">
                  thuthu
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleFillAccount("admin239", "12345678")}
                className="rounded-lg border border-[#cbd8ce] bg-white px-2 py-1.5 text-center transition-colors hover:border-[#1f5a45] hover:bg-[#e7eee3]"
              >
                <span className="block font-semibold text-[#617067]">
                  Độc giả
                </span>
                <span className="block font-mono text-[10px] text-[#718077]">
                  admin239
                </span>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#8b9a8f]">
              * Mật khẩu Admin: <strong>123456</strong>. Thủ thư &amp; Admin vào
              trang Quản lý.
            </p>
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
      ) : (
        <form
          className="mt-4 flex w-full flex-col gap-3"
          onSubmit={handleRegisterReader}
        >
          <div>
            <label className="text-xs font-semibold text-[#56675c] uppercase">
              Tên đăng nhập *
            </label>
            <input
              type="text"
              required
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              placeholder="VD: nguyenvanan"
              className="mt-1 h-9 w-full rounded-lg border border-[#cbd8ce] bg-[#fbfcfa] px-3 text-sm focus:border-[#1f5a45] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#56675c] uppercase">
              Mật khẩu *
            </label>
            <input
              type="password"
              required
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="Mật khẩu bảo mật"
              className="mt-1 h-9 w-full rounded-lg border border-[#cbd8ce] bg-[#fbfcfa] px-3 text-sm focus:border-[#1f5a45] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#56675c] uppercase">
              Họ và tên
            </label>
            <input
              type="text"
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="mt-1 h-9 w-full rounded-lg border border-[#cbd8ce] bg-[#fbfcfa] px-3 text-sm focus:border-[#1f5a45] focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-[#56675c] uppercase">
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="an@gmail.com"
                className="mt-1 h-9 w-full rounded-lg border border-[#cbd8ce] bg-[#fbfcfa] px-3 text-sm focus:border-[#1f5a45] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#56675c] uppercase">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="0912345678"
                className="mt-1 h-9 w-full rounded-lg border border-[#cbd8ce] bg-[#fbfcfa] px-3 text-sm focus:border-[#1f5a45] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#56675c] uppercase">
              Địa chỉ
            </label>
            <input
              type="text"
              value={regAddress}
              onChange={(e) => setRegAddress(e.target.value)}
              placeholder="Ký túc xá Khu B, ĐHQG"
              className="mt-1 h-9 w-full rounded-lg border border-[#cbd8ce] bg-[#fbfcfa] px-3 text-sm focus:border-[#1f5a45] focus:outline-hidden"
            />
          </div>

          {regError ? (
            <div className="flex items-start gap-2 rounded-lg border border-[#f2d6d3] bg-[#fdf3f2] p-2 text-xs text-[#b43428]">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <span>{regError}</span>
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={regLoading}
            className="mt-2 h-10 w-full bg-[#1f5a45] text-white hover:bg-[#174735]"
          >
            {regLoading ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <UserPlus className="mr-1.5 size-4" />
            )}
            Tạo tài khoản Độc giả
          </Button>

          <p className="text-center text-xs text-[#718077]">
            Đã có tài khoản?{" "}
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className="font-medium text-[#1f5a45] hover:underline"
            >
              Đăng nhập ngay
            </button>
          </p>
        </form>
      )}
    </>
  )
}
