# GridWatch Client

Production-grade Next.js 16 operations and consumer frontend for the **GridWatch** power grid monitoring, incident dispatching, and outage management platform in Bangladesh.

Built from the ground up to interface seamlessly with the live `gridwatch-api` backend service with zero mock fallbacks in production paths.

---

## Architecture & Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with React 19, TypeScript strict mode, and Turbopack compiler.
- **Runtime & Package Manager**: [Bun](https://bun.sh/) for blazingly fast scripts, dependency management, and local execution.
- **Styling & UI Components**: [Tailwind CSS v4](https://tailwindcss.com/) with custom dark/light theme tokens and accessible primitives based on `@base-ui/react` and `lucide-react`.
- **Data Fetching & Caching**: `@tanstack/react-query` v5 with optimistic updates, window-focus refetching, and background polling.
- **Form State & Validation**: `@tanstack/react-form` coupled with [Zod](https://zod.dev/) schemas for runtime type safety.
- **HTTP Client**: `ofetch` wrapper with automatic JSON transformation, JWT bearer injection, and unified error handling.
- **Linter & Formatter**: [Biome 2](https://biomejs.dev/) enforcing strict code quality, zero unused imports, and consistent styling without ESLint overhead.

---

## Directory Structure

Strictly structured without a `src/` wrapper directory:

```text
gridwatch-client/
├── app/                              # Next.js 16 App Router hierarchy
│   ├── (public)/                     # Unauthenticated routes
│   │   ├── (authentication)/
│   │   │   ├── login/                # Email/password authentication
│   │   │   ├── register/             # User onboarding
│   │   │   └── verify-email/         # OTP verification flow
│   │   └── page.tsx                  # Public landing / portal entry
│   ├── (dashboard)/                  # Authenticated role-based workspaces
│   │   ├── admin/                    # System KPIs, incidents, grid, users, audit logs
│   │   ├── operator/                 # Incident dispatch desk, my work, network topology
│   │   ├── customer/                 # Outage reporting, restoration stepper, bKash payments
│   │   └── layout.tsx                # Role guard & shell layout
│   ├── layout.tsx                    # Root layout with QueryProvider & ThemeProvider
│   └── globals.css                   # Tailwind v4 theme variables and utilities
├── api/                              # ofetch API integration clients
├── components/                       # Modular UI components
│   ├── auth/                         # Route guards & auth modals
│   ├── dashboard/                    # Header, Sidebar, DashboardShell, CommandPalette
│   ├── modules/                      # Domain views (admin, operator, customer, grid, outages)
│   ├── theme/                        # ThemeToggle and theme utilities
│   └── ui/                           # Base UI component primitives (dialog, button, table, etc.)
├── hooks/                            # Custom React Query mutation & query hooks
├── lib/                              # Utility helpers (cn, formatters, api-client)
├── providers/                        # QueryClientProvider and ThemeProvider
├── routes/                           # Role navigation configs and route constants
└── types/                            # TypeScript interfaces & domain models
```

---

## Role-Based Access Control (RBAC)

GridWatch provides tailored operational dashboards based on the authenticated user's role:

| Feature / Workspace | Admin | Operator | Customer |
| :--- | :---: | :---: | :---: |
| **System Overview & Revenue KPIs** | Yes | - | - |
| **User Directory & Account Status Control** | Yes | - | - |
| **Audit Logs & State Mutation Diffs** | Yes | - | - |
| **Outage Incident Log & Status Dispatching** | Yes | Yes | - |
| **Field Work Assignment & Resolution** | - | Yes | - |
| **Grid Infrastructure (Zones & Areas)** | Yes (Full CRUD) | Yes (Read/Filter) | - |
| **Consumer Telemetry & Restoration Stepper** | - | - | Yes |
| **Outage Self-Reporting Flow** | - | - | Yes |
| **bKash Priority Dispatch Fee (৳200)** | - | - | Yes |
| **Command Palette (⌘K / Ctrl+K)** | Yes | Yes | Yes |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (version 1.1 or later recommended)
- Running instance of `gridwatch-api` (default: `http://localhost:5000`)

### 1. Environment Setup

Copy `.env.example` to `.env.local` or create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Start Development Server

```bash
bun run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

### 4. Build for Production

```bash
bun run build
```

This compiles a fully optimized Next.js production build with strict TypeScript validation and static route generation.

---

## Quality Assurance & Scripts

| Command | Action |
| :--- | :--- |
| `bun run dev` | Launch local Turbopack development server |
| `bun run build` | Validate types and compile optimized production build |
| `bun run lint` | Check formatting and lint rules via Biome |
| `bun run format` | Auto-format codebase using Biome rules |

---

## Key Highlights

- **Command Palette**: Press `⌘K` or `Ctrl+K` from any view to search live outages, jump to grid sectors, trigger actions, or switch themes.
- **bKash Integration**: Secure priority payment flow (`POST /api/v1/payments/initiate`) with real redirect handling, status verification callbacks, and receipt views.
- **Hydration Safe**: Resilient client-side hydration protections guarding against third-party browser extension DOM mutations.
- **Theme Support**: Seamless Dark and Light modes with local storage persistence and system preference detection.

---

## License

GridWatch Operations Platform © 2026. All rights reserved.
