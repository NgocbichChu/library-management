import { useState, useEffect } from "react"
import { Settings, Save, ShieldCheck, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { useLibraryStore } from "@/stores/use-library-store"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const SettingsPage = () => {
  const { isAdmin } = useAuth()
  const { policy, updatePolicy, fetchPolicy } = useLibraryStore()

  const [formData, setFormData] = useState({
    policy_code: "",
    policy_name: "",
    max_borrow_books: 5,
    max_borrow_days: 14,
    overdue_fine_per_day: 5000,
    student_discount_rate: 20,
    lost_book_fine_rate: 100,
    damaged_book_fine_rate: 50,
    description: "",
  })

  useEffect(() => {
    if (policy) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        policy_code: policy.policy_code,
        policy_name: policy.policy_name,
        max_borrow_books: policy.max_borrow_books,
        max_borrow_days: policy.max_borrow_days,
        overdue_fine_per_day: policy.overdue_fine_per_day,
        student_discount_rate: policy.student_discount_rate,
        lost_book_fine_rate: policy.lost_book_fine_rate,
        damaged_book_fine_rate: policy.damaged_book_fine_rate,
        description: policy.description ?? "",
      })
    } else {
      void fetchPolicy()
    }
  }, [policy, fetchPolicy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) {
      toast.error(
        "Chỉ Quản trị viên (Admin) mới có quyền thay đổi chính sách hệ thống."
      )
      return
    }
    try {
      await updatePolicy({
        policy_code: formData.policy_code.trim(),
        policy_name: formData.policy_name.trim(),
        max_borrow_books: Number(formData.max_borrow_books),
        max_borrow_days: Number(formData.max_borrow_days),
        overdue_fine_per_day: Number(formData.overdue_fine_per_day),
        student_discount_rate: Number(formData.student_discount_rate),
        lost_book_fine_rate: Number(formData.lost_book_fine_rate),
        damaged_book_fine_rate: Number(formData.damaged_book_fine_rate),
        description: formData.description.trim() || null,
      })
      toast.success("Đã lưu quy định chính sách thư viện thành công!")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Lưu cài đặt thất bại")
    }
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Cài đặt quy định thư viện
        </h1>
        <p className="text-sm text-muted-foreground">
          Cấu hình chính sách hệ thống (system_policy) áp dụng cho mượn trả, hạn
          mức và mức phạt vi phạm.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              <CardTitle>Quy định mượn sách & Thời hạn</CardTitle>
            </div>
            <CardDescription>
              Các tham số kiểm soát số lượng tài liệu độc giả được phép mượn và
              số ngày mượn tối đa.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Mã chính sách</FieldLabel>
              <Input
                required
                value={formData.policy_code}
                onChange={(e) =>
                  setFormData({ ...formData, policy_code: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Tên chính sách</FieldLabel>
              <Input
                required
                value={formData.policy_name}
                onChange={(e) =>
                  setFormData({ ...formData, policy_name: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                Số lượng sách mượn tối đa (cuốn / độc giả)
              </FieldLabel>
              <Input
                type="number"
                min={1}
                max={20}
                required
                value={formData.max_borrow_books}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_borrow_books: Number(e.target.value),
                  })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Thời hạn mượn sách tối đa (ngày)</FieldLabel>
              <Input
                type="number"
                min={1}
                max={90}
                required
                value={formData.max_borrow_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_borrow_days: Number(e.target.value),
                  })
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-amber-600" />
              <CardTitle>Quy định mức phạt vi phạm (fine)</CardTitle>
            </div>
            <CardDescription>
              Tỷ lệ và đơn giá phạt áp dụng khi bạn đọc trả sách trễ hạn hoặc
              làm hư hỏng, thất lạc.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Phí phạt quá hạn mỗi ngày (VNĐ / ngày)</FieldLabel>
              <Input
                type="number"
                step={500}
                min={0}
                required
                value={formData.overdue_fine_per_day}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    overdue_fine_per_day: Number(e.target.value),
                  })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Tỷ lệ giảm giá cho Sinh viên (%)</FieldLabel>
              <Input
                type="number"
                min={0}
                max={100}
                required
                value={formData.student_discount_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    student_discount_rate: Number(e.target.value),
                  })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Tỷ lệ phạt làm mất sách (% giá trị sách)</FieldLabel>
              <Input
                type="number"
                min={100}
                max={300}
                required
                value={formData.lost_book_fine_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lost_book_fine_rate: Number(e.target.value),
                  })
                }
              />
            </Field>

            <Field>
              <FieldLabel>Tỷ lệ phạt làm hỏng sách (% giá trị sách)</FieldLabel>
              <Input
                type="number"
                min={10}
                max={100}
                required
                value={formData.damaged_book_fine_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    damaged_book_fine_rate: Number(e.target.value),
                  })
                }
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>Mô tả chi tiết chính sách</FieldLabel>
              <Input
                placeholder="Ghi chú thêm về điều kiện áp dụng..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HelpCircle className="size-4" />
            <span>
              {isAdmin
                ? "Mọi thay đổi sẽ có hiệu lực ngay với các giao dịch mượn mới."
                : "Chế độ chỉ đọc. Chỉ Quản trị viên (Admin) mới có quyền lưu thay đổi chính sách."}
            </span>
          </div>
          <Button
            type="submit"
            className="gap-2"
            disabled={!isAdmin}
            title={
              !isAdmin
                ? "Chỉ Quản trị viên mới có quyền lưu cấu hình"
                : undefined
            }
          >
            <Save className="size-4" /> Lưu cấu hình
          </Button>
        </div>
      </form>
    </div>
  )
}
