const express = require('express');
const cors = require('cors');
const cosmosService = require('./src/services/cosmosService');
const blobService = require('./src/services/blobService');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;

const calculateSeverity = (damageDetections) => {
    if (!damageDetections || damageDetections.length === 0) return "Pending";

    const classes = damageDetections.map(d => d.class.toLowerCase());

    if (classes.some(c => ['airbag_deployed', 'chassis_damage', 'shattered_windshield', 'rollover'].includes(c))) {
        return "Major";
    }
    if (classes.some(c => ['dent', 'door_damage', 'broken_light', 'bumper_damage', 'bonnet_damage'].includes(c))) {
        return "Medium";
    }
    return "Minor";
};

// Health check
app.get('/test-db', async (req, res) => {
    try {
        const incidents = await cosmosService.getAllIncidents();
        res.json({ message: "Connected to RoadifyDB!", count: incidents.length });
    } catch (error) {
        res.status(500).json({ error: "DB Connection Failed", details: error.message });
    }
});

// Generate batch SAS tokens for a claim's photos
app.post('/upload-tokens', async (req, res) => {
    try {
        const { claimId, photos } = req.body;
        if (!claimId || !photos || !photos.length) {
            return res.status(400).json({ error: "claimId and photos array required" });
        }
        const tokens = await blobService.generateBatchUploadUrls(claimId, photos);
        res.json({ tokens });
    } catch (err) {
        res.status(500).json({ error: "Failed to generate upload tokens", details: err.message });
    }
});

// Legacy single token endpoint
app.get('/get-upload-token', async (req, res) => {
    try {
        const result = await blobService.generateUploadUrl();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to generate SAS token", details: err.message });
    }
});

// Submit a complete claim
app.post('/submit-claim', async (req, res) => {
    try {
        const body = req.body;

        const claimData = {
            id: body.claimId || uuidv4(),
            type: "claim",
            status: "Submitted",
            severity: calculateSeverity(body.damageDetections),
            createdAt: new Date().toISOString(),

            driver: {
                name: body.driverName || "",
                phone: body.phone || "",
                policyNumber: body.policyNumber || "",
            },

            claimantVehicle: {
                rego: body.vehicleRego || "",
                make: body.vehicleMake || "",
                model: body.vehicleModel || "",
                year: body.vehicleYear || "",
                color: body.vehicleColor || "",
            },

            otherVehicle: body.thirdPartyInvolved ? {
                rego: body.otherVehicleRego || "",
                color: body.otherVehicleColor || "",
                make: body.otherVehicleMake || "",
                model: body.otherVehicleModel || "",
            } : null,

            incidentContext: {
                thirdPartyInvolved: body.thirdPartyInvolved ?? null,
                hitAndRun: body.hitAndRun ?? null,
                parkedWhenHit: body.parkedWhenHit ?? null,
                collisionObject: body.collisionObject || "",
                atFault: body.atFault ?? null,
            },

            incident: {
                type: body.incidentType || "",
                description: body.description || "",
                location: body.location || { lat: null, lng: null, address: null },
                timestamp: body.timestamp || new Date().toISOString(),
            },

            damageDetections: (body.damageDetections || []).map(d => ({
                class: d.class || d.label || "",
                confidence: d.confidence || 0,
            })),

            photos: body.photos || [],
        };

        const created = await cosmosService.createIncident(claimData);
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: "Failed to save claim", details: err.message });
    }
});

// Legacy endpoint — kept for backward compat
app.post('/submit-incident', async (req, res) => {
    try {
        const { aiResults } = req.body;
        const incidentData = {
            id: uuidv4(),
            ...req.body,
            status: "Submitted",
            severity: aiResults ? calculateSeverity(
                (aiResults.labels || []).map(l => ({ class: l }))
            ) : "Pending",
            createdAt: new Date().toISOString()
        };
        const createdItem = await cosmosService.createIncident(incidentData);
        res.status(201).json(createdItem);
    } catch (err) {
        res.status(500).json({ error: "Failed to save incident", details: err.message });
    }
});

// Dashboard: list all claims
app.get('/incidents', async (req, res) => {
    try {
        const { severity } = req.query;
        let incidents = await cosmosService.getAllIncidents();
        if (severity) {
            incidents = incidents.filter(i =>
                i.severity && i.severity.toLowerCase() === severity.toLowerCase()
            );
        }
        res.json(incidents);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch incidents", details: err.message });
    }
});

// Dashboard: single claim detail
app.get('/incidents/:id', async (req, res) => {
    try {
        const incident = await cosmosService.getIncidentById(req.params.id);
        if (!incident) return res.status(404).json({ error: "Incident not found" });
        res.json(incident);
    } catch (err) {
        res.status(500).json({ error: "Error retrieving incident", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Roadify Backend running on http://localhost:${PORT}`);
});
