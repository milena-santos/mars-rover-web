# Mars Rover Web

Mission Control UI in React + Vite + React Three Fiber for the Mars probe
challenge. Talks to
[`mars-rover-api`](https://github.com/milena-santos/mars-rover-api) over the
challenge REST endpoints.

**Live**

| Env                | URL                                                |
| ------------------ | -------------------------------------------------- |
| Production         | https://mars-rover-web-prod.vercel.app             |
| Staging            | https://mars-rover-web-staging.vercel.app          |
| API docs (prod)    | https://web-production-gbuy.onrender.com/api/docs/ |
| API docs (staging) | https://web-staging-pntn.onrender.com/api/docs/    |

## Overview

Configure the plateau mesh, launch probes at `(0, 0)`, send move/turn commands,
and see position + direction update from the API. The 3D scene is the mission
shell; the dock is the control surface for the same REST operations.

Desktop / landscape tablet only (viewport ≥ 1024px).

## Stack

- React 19 + TypeScript + Vite
- React Three Fiber / Drei / Three.js
- Vitest, ESLint, Prettier
- Vercel (static SPA from `dist/`)

## Requirements

- Node.js 22+
- API running with CORS allowing this origin
  ([mars-rover-api](https://github.com/milena-santos/mars-rover-api))

## Setup with local API

```bash
# terminal 1 — API (see mars-rover-api README)
cd ../mars-rover-api
cp .env.example .env   # include CORS_ALLOWED_ORIGINS=http://127.0.0.1:3000
docker compose up -d postgres
uv sync --group dev
uv run python src/manage.py migrate
uv run python src/manage.py runserver

# terminal 2 — UI
cd ../mars-rover-web
cp .env.example .env   # VITE_API_URL=http://127.0.0.1:8000
npm install
npm run dev
```

Open http://127.0.0.1:3000.

## What the UI does with the API

| UI action                                   | API                               |
| ------------------------------------------- | --------------------------------- |
| Confirm mesh + land at origin               | `POST /api/probes/`               |
| Pilot move / turn (`WASD`, arrows, `Q`/`E`) | `POST /api/probes/{id}/commands/` |
| Refresh probes / mission state              | `GET /api/probes/`                |
| Abandon mission                             | `DELETE /api/probes/`             |

## Flow

1. Start exploration (intro landing).
2. Choose a region and set plateau size.
3. Land probes at `(0, 0)`; pilot with keyboard.
4. Switch the active probe from the dock picker.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npm test
npm run format
npm run format:check
npm run audit
```

## CI and CD

GitHub Actions: Format, Lint, Types, Tests, Audit, Build.

| Git branch | Vercel                   | API               |
| ---------- | ------------------------ | ----------------- |
| `develop`  | Preview / staging domain | Render staging    |
| `main`     | Production               | Render production |

Set `VITE_API_URL` per Vercel environment. More workflow detail:
[CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](LICENSE)
