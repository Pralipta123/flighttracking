# Flight Tracking & Simulation Dashboard

Angular single-page application that simulates a live flight operations view: fleet table, interactive map (Leaflet), search and filters, flight details, safety alerts, incident reporting, and role-based UI.

**Stack:** Angular 18, Angular Material, RxJS, Reactive Forms, Leaflet (OpenStreetMap tiles).  
**CLI version:** 18.2.x (see `package.json`).

---

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Node.js** | **v18.x or v20.x LTS** recommended (Angular 18 is supported on current LTS). |
| **npm** | Installed with Node (npm 9+ is fine). |
| **Chrome** (optional) | Required locally if you run **unit tests** (`ng test` uses Karma + Chrome). |

Check versions:

```bash
node -v
npm -v
```

---

## Get the code

**Clone** (if you use Git):

```bash
git clone https://github.com/Pralipta123/flighttracking.git
cd flighttracking
```

Or open the project folder in your editor after downloading a ZIP.

---

## Install dependencies

From the project root (`flighttracking/` — the folder that contains `angular.json` and `package.json`):

```bash
npm install
```

This installs Angular, Material, CDK, Leaflet, and dev tooling. It may take a few minutes the first time.

---

## Run the app (development)

### Default (port 4200)

```bash
npm start
```

Or equivalently:

```bash
ng serve
```

Then open a browser at:

**http://localhost:4200/**

The dev server reloads when you change source files.

### Custom host / port

```bash
ng serve --host 0.0.0.0 --port 4300
```

Useful on a LAN or if port `4200` is already in use.

### Production-like build, served locally (optional)

```bash
ng build --configuration production
npx http-server dist/flighttracking -p 8080 -o
```

(You can use any static file server; `http-server` is only an example: `npx http-server …`.)

---

## Build for production

```bash
npm run build
```

By default this uses the **production** configuration (see `angular.json`). Output is written to:

**`dist/flighttracking/`**

For **GitHub Pages** (project site under `/flighttracking/`), the CI workflow uses:

```bash
ng build --configuration production --base-href /flighttracking/
```

Do not use that `base-href` when you deploy to the **root** of a domain; only use it when the app is served from a subpath.

---

## Run unit tests

```bash
npm test
```

Or:

```bash
ng test
```

Runs Karma + Jasmine in Chrome (headless in CI; interactive locally). Press `Ctrl+C` to stop the watcher.

---

## How to use the application

After `npm start`, open **http://localhost:4200/**.

| Area | What to do |
|------|------------|
| **Dashboard** | Table + map: live simulated positions, filters, row click or **Details** opens the flight. |
| **Role** (toolbar) | **Supervisor** / **Controller** / **Viewer** — controls status updates and incident form visibility. |
| **Alerts** (bell) | Lists generated alerts; snackbars fire for critical events. |
| **Incidents** | Reactive incident form (visible to Supervisor and Controller only). |
| **Flight detail** | Route `/flights/flight/:id` — aircraft, route, timeline, delays, comm logs. |

---

## Project layout (high level)

```
src/app/
  core/           # Models, guards, services (simulation, alerts, auth, mock WebSocket)
  features/flights/   # Lazy-loaded flights module (shell, dashboard, map, detail, incidents)
  shared/         # SharedMaterialModule (Angular Material imports)
```

Routing: `AppRoutingModule` lazy-loads `FlightsModule` under `/flights`.

---

## Deploy to GitHub Pages

This repository includes **[`.github/workflows/github-pages.yml`](.github/workflows/github-pages.yml)**. On each push to **`main`**, GitHub Actions installs dependencies, builds with `--base-href /flighttracking/`, and publishes **`dist/flighttracking`** to GitHub Pages.

### One-time GitHub settings

1. Repo → **Settings** → **Pages**.
2. **Build and deployment** → **Source** → select **GitHub Actions** (not “Deploy from a branch”).
3. Push to `main`, or **Actions** → **Deploy GitHub Pages** → **Run workflow**.

### Live URL (this repo name)

**https://pralipta123.github.io/flighttracking**

If you **rename the repository**, edit the workflow and set `--base-href` to `/<new-repo-name>/`.

---

## Scripts reference (`package.json`)

| Command | Purpose |
|---------|---------|
| `npm start` | Dev server (`ng serve`). |
| `npm run build` | Production build → `dist/flighttracking`. |
| `npm run watch` | Development build in watch mode. |
| `npm test` | Unit tests (Karma). |

---

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| **`npm install` errors** | Use Node 18 or 20 LTS; delete `node_modules` and `package-lock.json` only if advised, then `npm install` again. |
| **Port 4200 in use** | `ng serve --port 4300` |
| **`ng` not recognized** | Use `npx ng serve` or run scripts via `npm start` (uses local CLI). |
| **Tests fail to start Chrome** | Install Google Chrome or set `CHROME_BIN` to your Chromium path. |
| **Blank map** | Ensure the machine has network access (tiles load from OpenStreetMap). |
| **GitHub Pages blank / 404 on refresh** | Confirm Pages **Source** is **GitHub Actions** and the workflow `base-href` matches the repo name. |

---

## Assumptions & notes

- Data is **simulated** in the browser (no real ADS-B or airline API).
- **Alerts** (altitude drop, overspeed, long delay) are heuristic demos for the assignment.
- **Angular version** is **16** (assignment text mentioned 18+; upgrading is a separate migration).

---

## Further reading

- [Angular CLI docs](https://angular.io/cli)  
- [Angular Material](https://material.angular.io/)  
- [Leaflet](https://leafletjs.com/)
