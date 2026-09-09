import { Spinner } from "@/components/ui/spinner"
import { useLoadingStore } from "@/stores/use-loading-store"

export function GlobalLoading() {
  const isLoading = useLoadingStore((state) => state.isLoading)
  if (!isLoading) return null
  return (
    <div
      role="status"
      className="pointer-events-none fixed top-3 right-3 z-50 flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm shadow-sm"
    >
      <Spinner />
      Đang xử lý...
    </div>
  )
}
