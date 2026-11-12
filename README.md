# Mars Rover Web

Mission Control em Next.js + React Three Fiber para o desafio da sonda em Marte.
Explora a órbita, escolhe a região, configura a malha e pilota sondas no planalto.

## Requirements

- Node.js 22+
- API [`mars-rover-api`](https://github.com/milena-santos/mars-rover-api) com CORS
  liberado para este front

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000).

`NEXT_PUBLIC_API_URL` deve apontar para a API, por exemplo:

- local: `http://127.0.0.1:8000`
- staging: URL do Render staging
- production: URL do Render production

## Fluxo

1. Inicia a exploração e acompanha o pouso introdutório.
2. Escolhe a região e define a malha do planalto.
3. Lança sondas em `(0, 0)` e pilota com `WASD`/setas; `Q`/`E` giram.
4. Troca a sonda ativa pelo seletor do dock.

Telas abaixo de 1024px mostram aviso de suporte (desktop / tablet paisagem).

## Scripts

```bash
npm run dev
npm run format        # Prettier write
npm run format:check  # Prettier check (CI)
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm test              # Vitest
npm run build
npm run start
```

## CI and CD

GitHub Actions runs **Format** (Prettier), **Lint** (ESLint), **Types**,
**Tests** (Vitest), and **Build** on pull requests and on pushes to `develop` /
`main`.

Branch workflow (same as the API repo):

1. Short-lived branch → PR into `develop` (draft PR can be opened by
   `open-pr.yml` when you push `feature/**`, etc.).
2. Push/merge into `develop` → `release-pr.yml` opens or updates the release PR
   **`develop` → `main`**.
3. Merge into `main` → Vercel production (Git Integration).

| Git branch | Vercel target | API used by the UI |
| ---------- | ------------- | ------------------ |
| `develop`  | Preview       | Render staging     |
| `main`     | Production    | Render production  |

Set `NEXT_PUBLIC_API_URL` in the Vercel project for each environment.

Workflows that open pull requests should use the repository secret
`GH_WORKFLOW_TOKEN` (same pattern as the API repo).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
