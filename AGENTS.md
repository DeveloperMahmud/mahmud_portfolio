# Repository Agent Instructions

## Source of truth and resume procedure

- The project-local V2 master specification is `docs/MAHMUD_CODEX_MASTER_IMPLEMENTATION_INSTRUCTIONS_V2.md` (recorded SHA-256 is maintained in `.codex/PROJECT_PROGRESS.md`). This repository copy is the recovery source of truth; do not depend on the external Downloads copy.
- Persistent implementation state lives in `.codex/IMPLEMENTATION_CHECKLIST.md`, `.codex/PROJECT_PROGRESS.md`, `.codex/SESSION_HANDOFF.md`, and `.codex/IMPLEMENTATION_LOG.md`.
- When the user says `Continue`, `Resume`, `Next`, `Carry on`, or an equivalent instruction, first read the master specification and all four state files, inspect `git status`, reconcile the files with actual code, and resume the first dependency-ready unfinished task. Never restart verified work.
- After every meaningful task: save code, run focused validation, update all four state files, and identify the next exact action. Before stopping, leave a complete handoff.

## Permanent progress checkpoint protocol

- Keep every recovery record inside this project folder. Reuse only `.codex/IMPLEMENTATION_CHECKLIST.md`, `.codex/PROJECT_PROGRESS.md`, `.codex/SESSION_HANDOFF.md`, and `.codex/IMPLEMENTATION_LOG.md`; do not create a parallel tracking system.
- Before starting any new session or responding to `Continue`/`Resume`, read the master specification, this `AGENTS.md`, all four progress files, and inspect the actual Git/source state. Repository evidence overrides stale notes.
- After every meaningful task, update the checklist status and verification evidence, project summary, implementation log, and session handoff. Record modified files, commands/tests actually run, results, known bugs, blockers, pending work, and the exact next implementation step.
- During a partially completed or long-running task, write an intermediate checkpoint after each safe substep. Keep the task `IN_PROGRESS`; never mark it `COMPLETED` or `VERIFIED` merely because work stopped or a session ended.
- At every phase boundary, add a phase completion report covering all acceptance criteria, verification evidence, incomplete or blocked items, regression status, and the next dependency-ready phase/task. A phase is not complete while required tasks remain unfinished.
- Before any planned stop, interruption, context limit, or credit limit, update `SESSION_HANDOFF.md` so a fresh session can recover without chat history. If interruption prevented a checkpoint, the next session must reconcile the Markdown records against source and Git before changing code.
- Never fabricate test success or implementation status. Distinguish `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED`, `COMPLETED`, and `VERIFIED` exactly as defined in the checklist.

## Task routing

- The primary agent remains the coordinator and uses its default medium reasoning for ordinary work.
- Use project agent `medium_worker` only when a routine independent subtask materially benefits from delegation: UI components, frontend pages, responsive styling, simple bug fixes, concept/demo pages, documentation, or focused test work.
- Use project agent `high_specialist` for complex architecture, CMS/Page Studio integration, Prisma/database changes, authentication, authorization, security, publishing, migrations, difficult debugging, or high-risk cross-system changes.
- For complex research or architecture analysis, prefer one bounded `high_specialist` task before implementation.
- Prefer the lowest sufficient reasoning effort. Do not spawn agents for trivial sequential work, do not delegate merely to appear parallel, and do not run agents that would edit the same files concurrently.
- The parent agent owns integration, final verification, progress-file updates, and user-facing reporting. A subagent result is evidence, not automatic acceptance.
- Subagents inherit the parent permissions. They may not deploy, push, expose secrets, or perform destructive git operations.

## Engineering constraints

- Preserve the existing Express 5 + TypeScript + Prisma/PostgreSQL + vanilla frontend architecture.
- Extend the authenticated CMS and Page Studio; do not create a second CMS or replace working systems.
- Preserve existing routes, public content, database records, RBAC, revisions, publishing, media, analytics, SEO, responsive behavior, and `widget-qa.html`.
- Use additive migrations and idempotent seeds. Never reset production data.
- Tool concept demos must be clearly labeled sample/preview experiences. Never represent mock behavior as a live engine.
- Do not add fake clients, testimonials, jobs, metrics, certifications, employment claims, or live URLs.
- Avoid unnecessary dependencies and heavy global assets. Validate URLs, rich content, embeds, and public/private boundaries server-side.
- Do not commit, push, or deploy unless the user authorizes that action for the current work.

## Verification

- Start with focused tests, then run broader build/regression checks appropriate to risk.
- Distinguish `COMPLETED` from `VERIFIED`; only verification against stated acceptance criteria earns `VERIFIED`.
- Record commands, results, blockers, and known limitations in the persistent state files.

## Permanent visual review workflow

- After every meaningful UI task, run the relevant focused checks, provide the exact affected local preview URL, describe the visible change, and list any functionality that remains unverified.
- A UI feature is `VISUALLY VERIFIED` only after it has actually been opened in a browser and checked at the relevant desktop and mobile viewport. Source inspection, static tests, HTTP status, or a successful build alone do not count as visual verification.
- Keep implementation evidence distinct: `IMPLEMENTED` means the code exists, `TESTED` means automated or HTTP checks ran, `VISUALLY VERIFIED` means browser evidence was collected, and `NOT VERIFIED` means the required evidence is absent or blocked.
- At every phase boundary, run the application locally when a safe environment is available; inspect completed routes and interactions on desktop and mobile; capture screenshots when supported; and record URLs, viewport coverage, results, limitations, and screenshots in the existing four `.codex` tracking files.
- Never use production database credentials for local visual verification. When PostgreSQL or private environment variables are unavailable, use a loopback-only static preview for presentation checks and clearly mark API, persistence, authentication, CMS mutation, and database-derived content as `NOT VERIFIED`.
- Do not expose a local preview publicly. Bind preview servers to `127.0.0.1` and document the process/port plus the command needed to stop or resume it.
