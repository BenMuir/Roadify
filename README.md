# Roadify

Frictionless vehicle incident reporting powered by ML and AI. Drivers submit claims in under 3 minutes — insurance assessors get instant, data-rich triage with automated damage detection and fraud analysis.

## Live Demo

| App | URL |
|-----|-----|
| **Driver App** (mobile-friendly) | https://thankful-grass-0b8a37800.7.azurestaticapps.net |
| **Claims Dashboard** | https://roadify-api-akira.azurewebsites.net |

## How It Works

1. **Driver opens the app** — enters their name (saved locally), sees their vehicle and current location.
2. **Takes photos** — up to 6 angles with real-time AI coaching on what to capture next.
3. **Instant processing** — Roboflow ML detects and annotates damage, OpenAI reads plates and identifies vehicles. Runs in parallel.
4. **Reviews & submits** — claim is submitted instantly. No waiting.
5. **Backend generates AI report** — GPT-5.4 asynchronously produces a full incident report with severity assessment, liability opinion, scene analysis, weather cross-check, and fraud indicators.
6. **Assessor triages on dashboard** — annotated images, interactive map, AI report with inline photo references, fraud risk score, and one-click actions.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Driver App | React (Vite), Tailwind CSS, Framer Motion, Leaflet |
| Backend | Node.js, Express, Azure App Service |
| Database | Azure Cosmos DB (SQL API) |
| Photo Storage | Azure Blob Storage (SAS tokens) |
| Dashboard | Vanilla JS, Tailwind CSS, Leaflet |
| ML / AI | Roboflow (damage detection), OpenAI GPT-4o-mini (photo analysis), GPT-5.4 (incident reports) |
| Weather | Open-Meteo API |
| Hosting | Azure Static Web App (driver), Azure App Service (backend + dashboard) |

## Documentation

- [APIs & Integrations](docs/apis-and-integrations.md)
- [Azure Setup](docs/azure-setup.md)
- [Tech Stack & Architecture](docs/tech-stack-and-architecture.md)

## Local Development

```bash
# Backend
cd /tmp/roadify-backend
npm install
node server.js  # Runs in local mode (JSON DB + local photo storage)

# Driver App
cd driver-app
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
```

## Team

Built at a hackathon.
