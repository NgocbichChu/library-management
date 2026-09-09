import { useLoadingStore, withLoading } from "@/stores/use-loading-store"

export function useLoading() {
  const isLoading = useLoadingStore((state) => state.isLoading)
  const pendingCount = useLoadingStore((state) => state.pendingCount)
  const startLoading = useLoadingStore((state) => state.startLoading)
  const stopLoading = useLoadingStore((state) => state.stopLoading)
  return { isLoading, pendingCount, startLoading, stopLoading, withLoading }
}
