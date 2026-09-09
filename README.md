# Library Management

[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](#)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000?logo=shadcnui&logoColor=fff)](#)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)

A library management frontend for books, readers, and borrowing activities.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router
- React Hook Form + Zod

## Project Structure

```text
library-management/
├── public/          # Static assets
├── src/
│   ├── components/  # Shared UI components
│   ├── config/      # Navigation configuration
│   ├── features/    # Feature screens
│   ├── hooks/       # Reusable hooks
│   ├── layouts/     # Page layouts
│   └── lib/         # Utilities
└── README.md
```

## Development

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

```bash
pnpm lint       # Check code style
pnpm typecheck  # Check TypeScript
pnpm build      # Build for production
```

The login form currently opens the dashboard after validation. API integration and library management features will be added later.
