# CLAUDE.md - Guide for Claude Code in GAIA

## Build & Run Commands
- Build: `pnpm build` or `turbo run build`
- Format: `pnpm format` (uses Biome)
- Lint: `pnpm lint` (uses Biome)
- Test: `pnpm test` - Runs all tests
- Test specific package: `pnpm test <package-name>`
- Test specific file: `pnpm test path/to/file.test.ts`
- Dev mode: `pnpm dev`

## Code Style Guidelines
- **Formatting**: Using Biome for formatting with double quotes and mandatory semicolons
- **Types**: TypeScript with strict mode disabled, avoid `any` where possible
- **Imports**: Use ES Modules, group imports logically
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- **Error Handling**: Use typed errors and proper async/await error handling
- **Components**: Follow functional component patterns with TypeScript
- **Modules**: Export named entities, avoid default exports

## Project Structure
- Monorepo managed with pnpm workspaces and Turborepo
- Packages in `packages/` directory with common configuration
- Core logic in `@elizaos/core`
- Clients (Discord, Twitter, etc.) in client-* packages
- Plugins in plugin-* packages