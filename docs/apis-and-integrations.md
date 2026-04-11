# Roadify — APIs & Integrations

## 1. Roboflow (Damage Detection)

**What it does:** Automated ML-based vehicle damage detection and annotation.

**Endpoint:** Roboflow Workflows API (serverless)

**How we use it:**
- Each uploaded photo is resized to 1024px max and sent as base64 to the Roboflow workflow.
- The workflow runs a custom-trained object detection model that identifies damage types: dents, scratches, broken lights, bumper damage, bonnet damage, windshield damage, etc.
- Returns bounding-box predictions (class + confidence) and an annotated image with damage regions highlighted.
- All photos are processed **in parallel** for speed.

**Output:** Damage class labels, confidence scores, and annotated images overlaid on originals.

---

## 2. OpenAI GPT (Photo Analysis + Incident Report)

We make **two separate calls** to OpenAI — one on the client, one on the backend.

### 2a. Photo Analysis (Client-Side) — `gpt-4o-mini`

**What it does:** Reads number plates, identifies vehicles, and classifies the incident.

**How we use it:**
- Sends up to 6 photos with a prompt describing the claimant's vehicle.
- GPT reads licence plates, identifies the other vehicle's make/model/color, and classifies the incident type (collision, rollover, hit-and-run, etc.).
- Generates a brief factual description of the incident.
- Runs **in parallel** with Roboflow so there's no added wait time.

**Output:** Other vehicle details (rego, make, model, color), incident type, description.

### 2b. AI Incident Report (Backend, Async) — `gpt-5.4`

**What it does:** Generates a comprehensive claims assessment with fraud analysis.

**How we use it:**
- Triggered **asynchronously** on the backend after the claim is submitted — the user doesn't wait for it.
- Receives: claim data, ML damage detections, weather data, incident context, and up to 3 original photos (via signed Azure Blob URLs).
- Produces a structured JSON report containing:
  - Severity narrative and repair class estimate
  - Liability assessment
  - Scene assessment (inferred road surface, speed, vehicle positions)
  - Weather cross-check (compares API weather vs. what's visible in photos)
  - Fraud analysis with risk score (1-10) and specific indicators
  - Photo references with inline mentions for the dashboard

**Output:** Full JSON report stored in CosmosDB alongside the claim.

### 2c. Photo Coverage Coach (Client-Side) — `gpt-4o-mini`

**What it does:** Real-time guidance while the user takes photos.

**How we use it:**
- As the user adds photos, it evaluates coverage and suggests what's missing (e.g. "Take a wide scene shot" or "Get the other vehicle's plate").
- Uses `detail: 'low'` for fast responses.

---

## 3. Open-Meteo (Weather)

**What it does:** Provides real-time weather data at the incident location.

**Endpoint:** `https://api.open-meteo.com/v1/forecast`

**How we use it:**
- When the app gets the user's GPS location, it fetches current weather conditions (temperature, wind speed, weather code).
- This data is included in the claim payload and passed to the AI report.
- The dashboard displays a visual cross-check: "Local weather at time" vs. "Visible in photos" — if there's a mismatch (e.g. API says clear but photos show snow), it's flagged.

**Why:** Free, no API key required, provides an independent data point for fraud detection.

---

## 4. CARTO / Leaflet (Maps)

**What it does:** Interactive maps showing incident location.

**How we use it:**
- **Driver app:** Shows the user's current location on the welcome page using CARTO dark tiles via Leaflet.
- **Dashboard:** Displays the incident location with a marker and a "Google Maps" button for the claims assessor.

---

## 5. Azure Cosmos DB (Database)

**What it does:** Stores all claim data as JSON documents.

**How we use it:**
- Each claim is a single document with all fields: driver info, vehicle details, incident context, photos metadata, ML detections, AI report, severity, weather.
- Partitioned by claim `id` for fast lookups.
- The AI report is written back to the same document asynchronously after generation.

---

## 6. Azure Blob Storage (Photos)

**What it does:** Stores original and annotated claim photos.

**How we use it:**
- Photos are uploaded as base64 in the claim payload, then the backend uploads them to Blob Storage.
- Stored under `claims/{claimId}/{slot}-{type}.jpg`.
- Dashboard access uses time-limited read-only SAS tokens generated server-side (no public blob access).
