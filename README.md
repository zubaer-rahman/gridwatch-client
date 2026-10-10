# GridWatch Client

Frontend application for the GridWatch outage management and power grid telemetry platform in Bangladesh.

## Tech Stack

- **Framework**: Next.js 16 (App Router, `output: "export"`, `reactCompiler: true`)
- **Runtime**: React 19, TypeScript Strict
- **Package Manager**: Bun
- **Styling**: Tailwind CSS v4, shadcn UI (`base-nova` on `@base-ui/react`)
- **Data & State**: `@tanstack/react-query`, `@tanstack/react-form`, `ofetch`, `zod`
- **Linting & Formatting**: Biome 2

## Scripts

```bash
bun install    # Install dependencies
bun run dev    # Start development server
bun run build  # Production static build
bun run lint   # Run Biome linter check
bun run format # Auto-format with Biome
```

## Architecture

Follows the PH Healthcare structural conventions with strict Next.js App Router routing inside `src/app/`.
Features and domains are organized within `src/components/modules/`, `src/api/`, `src/hooks/`, `src/types/`, and `src/routes/`.
