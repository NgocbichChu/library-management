# Shared stores

- Auth: select `user`, `status`, `error`, `login` or `logout` from useAuthStore.
- Login currently uses a mock service. Set VITE_USE_MOCK_API=false and configure src/api/auth.ts when the backend is ready. See ../api/README.md.
- Session is in memory; reloading returns to login. Credentials are never stored. Route guards are UI navigation only; the future backend must validate access.
- Loading: useLoading() exposes isLoading, pendingCount, startLoading, stopLoading, withLoading. Pair manual start/stop calls in try/finally; prefer withLoading for async work.

```tsx
const user = useAuthStore((state) => state.user)
const login = useAuthStore((state) => state.login)
await login({ email, password })

const { isLoading, withLoading } = useLoading()
await withLoading(() => fetchBooks())
```

Outside React: useAuthStore.getState().logout(), or import withLoading directly. Concurrent tasks share a counter; loading ends when all tasks finish, including failures.
