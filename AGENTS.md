Quick, high-signal instructions for OpenCode agents working on this repo.

Repository facts (verified)
- Framework: Next.js (package.json: next ^16). React 19.
- App entry: app/ (Next 13+/App Router). Server and client code live under app/, components/, and data/.
- Runtime output directory: .next (generated). Do not commit.

Important developer commands (exact)
- Start dev server: npm run dev  # runs `next dev`
- Build: npm run build  # runs `next build`
- Start production server (after build): npm run start  # runs `next start`
- Predeploy checks (use before publishing): npm run predeploy:check  # validates images & links then builds
- Full predeploy report + checks: npm run predeploy:report
- E2E (Playwright):
  - Install browsers: npm run e2e:install  # runs `npx playwright install --with-deps`
  - Run tests: npm run test:e2e  # runs `npx playwright test`

Repo-specific workflows & gotchas
- Environment variables: repository uses a local env file .env.local (present in repo). Tests/builds rely on it—do not overwrite without checking. AGENT should read it but not commit secrets.
- Tenant/site data lives under data/site/ and scripts expect that structure. When modifying assets or product data, run the validate scripts:
  - npm run validate:tenant-images
  - npm run validate:tenant-content-links
- Predeploy ordering matters: run validate scripts before build; use npm run predeploy:check to run them in correct order.
- Generated artifacts: .next/, .next/dev/ and test-results/ are generated. Ignore them for commits.

Testing notes
- Playwright tests are under tests/e2e/; they may require browsers installed via npm run e2e:install. Running tests may open browser processes—use CI-friendly flags if necessary.

Code and maintenance notes agents commonly miss
- This repo uses Next.js App Router (app/) not pages/. Prefer editing app/ entry files when changing routing/layout.
- There are build-time scripts under scripts/*.mjs that produce predeploy reports and validate tenant content—these are part of the deploy gate.
- There is a simple site-level MCP config at .mcp/context7.json. If adding MCP files, keep them under .mcp/ and follow the existing key names (environments -> context7).

Where to look first when debugging
- package.json (scripts) — exact commands
- data/site/ — tenant content and product data
- scripts/*.mjs — predeploy validation and export tasks
- app/ and components/ — real application entry points and UI

When to ask the user (only ask these)
- Which secrets (vault keys or external env) should be used instead of .env.local for CI or deploy? (short answer required)
- Is there a required Node.js major version or engine constraint not checked into repo?

Keep this file small and factual. If you add repo-wide conventions, update this file with one-line commands and exact paths.

## Documentation Policy

When implementing or modifying framework or library functionality:

- Use Context7 MCP to consult current official documentation.
- Prefer Context7 over relying on model memory for framework APIs.
- Use Context7 especially for Next.js, React, TypeScript, OpenAI, Tailwind CSS and other rapidly changing libraries.
- Verify APIs against the current project versions before implementation.
- Do not use deprecated APIs when current documentation provides a supported alternative.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
