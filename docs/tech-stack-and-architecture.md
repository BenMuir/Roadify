# Roadify — Tech Stack & Architecture

## Overview

Roadify is a frictionless vehicle incident reporting platform. A driver submits a claim through a mobile app in under 3 minutes. The system uses ML and AI to automatically detect damage, read plates, assess severity, and flag potential fraud — giving insurance assessors an instant, data-rich triage view.

## Architecture Flow

```
┌─────────────────┐       ┌─────────────────┐       ┌──────────────┐
│   Driver App    │──────▶│  Azure Backend   │──────▶│  Cosmos DB   │
│   (React SPA)   │ POST  │  (Node/Express)  │       │  (Claims DB) │
└────────┬────────┘       └────────┬────────┘       └──────────────┘
         │                         │
         │  Photos (base64)        │  Async after response
         │                         ▼
         │                ┌─────────────────┐       ┌──────────────┐
         │                │   OpenAI GPT-5.4 │       │ Azure Blob   │
         │                │   (AI Report)    │       │ (Photos)     │
         │                └─────────────────┘       └──────────────┘
         │
         ├──▶ Roboflow (ML damage detection)     ─── runs in parallel
         └──▶ OpenAI GPT-4o-mini (plate reading) ─── runs in parallel
```

## Tech Stack

### Driver App (Frontend)
| Technology | Purpose |
|-----------|---------|
| **React** (Vite) | UI framework, fast builds |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Page transitions and animations |
| **Leaflet + CARTO tiles** | Interactive map on welcome page |
| **Azure Static Web App** | Hosting |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **Azure App Service** (Linux) | Hosting |
| **Azure Cosmos DB** (SQL API) | Document database for claims |
| **Azure Blob Storage** | Photo storage with SAS token access |

### Dashboard (Claims Triage)
| Technology | Purpose |
|-----------|---------|
| **Vanilla JS + Tailwind** | Lightweight, served as static files from the backend |
| **Leaflet + CARTO tiles** | Incident location map |
| Built into the backend's `/public` folder | No separate deployment needed |

### AI & ML Pipeline
| Technology | Purpose |
|-----------|---------|
| **Roboflow Workflows** | Damage detection (object detection model) |
| **OpenAI GPT-4o-mini** | Plate reading, vehicle identification, incident classification |
| **OpenAI GPT-5.4** | Comprehensive incident report with fraud analysis |
| **Open-Meteo API** | Weather data for cross-checking |

## ML Pipeline: How Damage Detection Works

1. **Photo capture** — User takes up to 6 photos from different angles (front, rear, close-up, plate, wide scene, other).

2. **Roboflow processing** — Each photo is sent to a Roboflow Workflows pipeline that runs a car damage detection model. The model identifies and localises damage types (dents, scratches, broken lights, bumper/bonnet damage, windshield damage). It returns:
   - Bounding box predictions with class labels and confidence scores
   - Annotated images with damage regions visually highlighted

3. **Parallel OpenAI analysis** — While Roboflow runs, the same photos are sent to GPT-4o-mini to read licence plates, identify vehicle makes/models, and classify the incident type. These run concurrently so there's no extra wait.

4. **Instant submission** — The claim is submitted immediately with ML detections and photo analysis results. The user gets a confirmation in seconds.

5. **Async AI report** — After the backend responds to the user, it kicks off GPT-5.4 in the background. This model receives:
   - All claim data (vehicles, context, location)
   - ML damage detections from Roboflow
   - Weather data from Open-Meteo
   - Up to 3 original photos via signed Blob URLs

   It produces a structured report covering severity, liability, scene assessment, and a detailed fraud analysis with a risk score.

6. **Dashboard display** — The assessor sees everything in one view: annotated images (toggle original/annotated), damage detections, the AI report with inline photo references (hover to preview), weather cross-check, fraud indicators, and an interactive map.

## Key Design Decisions

- **Async report generation** — Moving the AI report to the backend means the user submits instantly (~3 seconds) instead of waiting 30+ seconds for GPT to finish. The report appears on the dashboard when ready.

- **Parallel API calls** — Roboflow and OpenAI photo analysis run concurrently, cutting processing time roughly in half.

- **Fraud as a feature, not a blocker** — The fraud analysis provides indicators and a risk score for the assessor but never blocks submission. It's a tool for the claims team, not a gate for the driver.

- **Weather cross-check** — By automatically capturing GPS weather at claim time and comparing it to what the AI sees in photos, we create an independent verification layer that's hard to fake.

- **Photo references** — The AI references specific photos inline (e.g. "severe front-end damage in Photo 2"), and the dashboard creates hoverable links so the assessor can instantly see what the AI is referring to.
