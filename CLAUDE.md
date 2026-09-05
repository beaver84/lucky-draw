# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (default port 5173)
- `npm run build` — type-check (`tsc -b`) then production build
- `npm run test` — run Vitest once (`vitest run`)
- `npx vitest` — watch mode; `npx vitest run src/domain/draw.test.ts` for a single file
- `npm run lint` — oxlint
- `npm run preview` — serve the production build locally

No backend — this is a client-only SPA. There is no server, DB, or API to run.

## What this app is

럭키드로우 (Lucky Draw): a prize-raffle web app for events. An operator registers participants and prizes; a host spins a wheel on a shared/projector screen to reveal results live. `Requirement.md` is the authoritative spec, in Korean — read it in full before implementing any feature; the summary below only orients you to the core rules that cut across screens and data.

## Stack

Vite + React + TypeScript, Zustand (with `persist` middleware → localStorage) for state, Tailwind CSS v4 (via `@tailwindcss/vite`, no config file — see `src/index.css`), Vitest + Testing Library for tests. No router — screen switching is a single `if` on `config.status` in `App.tsx`.

## Architecture

```
src/
  types.ts              # Participant / Prize / DrawHistoryEntry / EventConfig — mirrors Requirement.md §5
  domain/                # Pure functions, no React/store imports. Unit-tested here (draw.test.ts).
    participants.ts      # parseParticipantLines (dedupe, one name per line/comma), generateNumberedParticipants
    prizes.ts             # parsePrizeLines — one prize name per line, repeated lines merge into quantity
    draw.ts                # computeWheelSlots / pickParticipant / spinWheel — the RNG core, spec §6
    csv.ts                  # history -> CSV string
  store/
    eventStore.ts         # single Zustand store: participants, prizes, history, config, pendingDraw
  components/
    setup/                # registration screen pieces (spec §4.1) — ParticipantPanel/PrizePanel are live
                            # textareas that fully rebuild the store's participants/prizes array on every
                            # keystroke (setParticipantsFromText/setPrizesFromText); there is no separate
                            # add/edit/delete list UI, the textarea itself is the source of truth pre-draw
    draw/                  # Wheel (SVG + spin), DrawHeader/StatTiles/WinnerRows/ResultBanner/DrawActionBar
                            # (the compact in-progress layout), CompletedSummary (spec §4.4 end screen)
    status/                # StatusPanel, WinnerTable, LoseTable (detailed secondary panel shown below the
                            # compact draw UI), EndControls (CSV export only — reset lives in DrawActionBar
                            # for the in-progress screen, and in CompletedSummary's own button for the end screen)
  lib/
    download.ts             # downloadTextFile — shared blob+anchor trigger used by CSV export buttons
  pages/
    SetupPage.tsx          # shown while config.status === 'SETUP'
    DrawPage.tsx            # shown while IN_PROGRESS; renders CompletedSummary directly once COMPLETED
  App.tsx                  # routes on config.status, nothing else
```

`DrawPage`'s compact layout intentionally duplicates data already shown in the detailed `StatusPanel` below it (remaining counts, winner list) — the compact version is what stays above the fold for the projector view, the detailed panel is the operator's full drill-down (꽝 명단, per-prize quantities). Keep both in sync if you change how remaining/winner counts are derived.

### The draw flow: predetermine-then-animate

Spec §6.2 requires the wheel's stop position to match a result decided *before* the animation starts — never "spin then pick." This is implemented as a two-phase commit in `eventStore.ts`:

1. **`startDraw()`** — picks the participant (`pickParticipant`) and the wheel outcome (`computeWheelSlots` + `spinWheel`) from current state, and stores them in `pendingDraw` (round, participant, frozen slot array, result index). Nothing else changes yet — prizes/participants/history are untouched.
2. `DrawPage` reads `pendingDraw` and renders `Wheel` with that frozen slot array and `targetIndex = pendingDraw.resultIndex`. The CSS rotation target is computed so the winning slice always lands upright under the pointer (see the comment above `labelRotation` in `Wheel.tsx` — do not add a per-slice "upside-down" text flip, it breaks that guarantee).
3. When the CSS transition ends, `DrawPage.handleSpinEnd` reads the still-live `pendingDraw` for display text, then calls **`commitPendingDraw()`**, which atomically updates participant status, prize `remainingQuantity`, appends the history entry, and re-evaluates `COMPLETED` — all in one `set()` call.

`pendingDraw` is deliberately excluded from the `persist` `partialize` in `eventStore.ts`: it's in-flight, pre-commit state. If the page reloads mid-spin, it's simply dropped (nothing was ever partially applied, since commit only happens post-animation) rather than resumed — this satisfies spec §7.3/§8's "refresh during a draw must recover safely."

### Wheel slot model

`computeWheelSlots` (domain/draw.ts) makes one slot per remaining prize unit plus exactly one `LOSE` slot, so a uniform pick over slots directly reproduces the §6.2 probability formula (`remaining_qty / (sum(remaining_qty) + 1)`) without needing separate weighting logic.

### State machine

`config.status`: `SETUP → IN_PROGRESS → COMPLETED`. `COMPLETED` is set inside `commitPendingDraw` when either all prizes are at 0 remaining, or no participant is left `ELIGIBLE` (spec §4.4's two end conditions). `resetAll()` restores the full initial state (including status back to `SETUP`).

`config.manualParticipantSelection` is stored and toggleable from the setup screen but **not wired into `startDraw` yet** — the participant pick is always `pickParticipant`'s uniform random choice regardless of this flag. Implementing manual pick means changing `startDraw` to accept a chosen participant id when this flag is on, plus a picker UI on `DrawPage`.

## Testing

`src/domain/draw.test.ts` covers the RNG core: slot composition, empty/zero-quantity edge cases, and a large-trial statistical check that win probability tracks remaining quantity. Domain functions are pure and take plain data — prefer adding new draw/prize/participant logic there (testable) over inline component logic.
