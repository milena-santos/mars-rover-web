# Mars Rover Web

Interface React (Next.js) para o desafio da sonda em Marte. Permite configurar
a malha, lançar sondas, enviar comandos e visualizar posição e direção.

## Requirements

- Node.js 20+
- API `mars-rover-api` rodando com CORS liberado para este front

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Abra [http://127.0.0.1:3000](http://127.0.0.1:3000).

`NEXT_PUBLIC_API_URL` deve apontar para a API, por exemplo:

- local: `http://127.0.0.1:8000`
- staging: `https://web-staging-pntn.onrender.com`

## Fluxo

1. Informe `x`, `y` e `direction` e lance a sonda (sempre nasce em `(0, 0)`).
2. Selecione a sonda e envie comandos `M`, `L`, `R`.
3. Acompanhe o estado no planalto e na lista.

## Scripts

```bash
npm run dev
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run start
```

## CI and CD

GitHub Actions runs `Format`, `Lint`, `Types`, and `Build` on pull requests and
on pushes to `develop` / `main`. Concurrent runs for the same commit are
cancelled so required check names are not duplicated.

Workflows that open pull requests should use the repository secret
`GH_WORKFLOW_TOKEN` (same pattern as the API repo).

Continuous delivery is handled by Vercel:

| Git branch | Vercel target           | API used by the UI |
| ---------- | ----------------------- | ------------------ |
| `develop`  | preview / staging alias | Render staging     |
| `main`     | production              | Render production  |

Set `NEXT_PUBLIC_API_URL` in the Vercel project for each environment.
