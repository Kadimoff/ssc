# Student Startup Community frontend

Student Startup Community is a frontend-only professional community prototype rebuilt with React 19, Vite, TypeScript, Tailwind CSS 4, TanStack Router/Query, and shadcn/ui components.

The UI foundation is derived from [shadcn-admin](https://github.com/satnaing/shadcn-admin) at commit `e16c87f`, under the included MIT license.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The default offline demo requires no backend.

## Demo account

- Username: `demo`
- Password: `demo123`

## Runtime modes

- `?mode=demo` uses the local typed demo client.
- `?mode=api` uses the HTTP client targeting `http://127.0.0.1:3443` by default.
- `?resetDemo=1` clears v2 demo data and session.

Legacy `studentStartupCommunityDemoData.v1` browser data is migrated once to the v2 schema and backed up before conversion.

## Quality checks

```bash
npm test
npm run lint
npm run build
```
