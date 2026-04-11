const express = require('express');
const cors = require('cors');
const path = require('path'); // FIXED: Added missing import
const cosmosService = require('./src/services/cosmosService');
const blobService = require('./src/services/blobService');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serving the static dashboard files
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// --- Severity Logic ---
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

// --- Routes ---

// Health check
app.get('/test-db', async (req, res) => {
    try {
        const incidents = await cosmosService.getAllIncidents();
        res.json({ message: "Connected to RoadifyDB!", count: incidents.length });
    } catch (error) {
        res.status(500).json({ error: "DB Connection Failed", details: error.message });
    }
});

// Batch SAS tokens
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

// Submit a complete claim (New Professional Structure)
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

            // Other fields remain as you had them...
            incident: {
                location: body.location || { lat: null, lng: null, address: null },
                timestamp: body.timestamp || new Date().toISOString(),
                description: body.description || "",
            },
            photos: body.photos || [],
            damageDetections: (body.damageDetections || []).map(d => ({
                class: d.class || d.label || "",
                confidence: d.confidence || 0,
            })),
        };

        const created = await cosmosService.createIncident(claimData);
        res.status(201).json(created);
    } catch (err) {
        res.status(500).json({ error: "Failed to save claim", details: err.message });
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

// Delete a claim
app.delete('/incidents/:id', async (req, res) => {
    try {
        const deleted = await cosmosService.deleteIncident(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Deleted", id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: "Delete failed", details: err.message });
    }
});

// Catch-all for Dashboard
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Roadify Backend running on http://localhost:${PORT}`);
});