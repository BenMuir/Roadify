const express = require('express');
const cors = require('cors'); 
const cosmosService = require('./src/services/cosmosService');
const blobService = require('./src/services/blobService');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors()); 
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- HELPER: Triage Logic ---
// This turns Roboflow labels into the business severity levels you promised the mentor.
const calculateSeverity = (aiResults) => {
    if (!aiResults || !aiResults.labels) return "Pending";
    
    const labels = aiResults.labels.map(l => l.toLowerCase());
    
    // Logic: If it's structural or safety-related, it's Major.
    if (labels.includes('airbag_deployed') || labels.includes('chassis_damage') || labels.includes('shattered_windshield')) {
        return "Major";
    }
    // Logic: Dents or multiple panels.
    if (labels.includes('dent') || labels.includes('door_damage')) {
        return "Medium";
    }
    // Default to Minor for scratches/paint.
    return "Minor";
};

// 1. Test Route: Check if infrastructure is alive
app.get('/test-db', async (req, res) => {
    try {
        const incidents = await cosmosService.getAllIncidents();
        res.json({ message: "Connected to RoadifyDB!", count: incidents.length });
    } catch (error) {
        res.status(500).json({ error: "DB Connection Failed", details: error.message });
    }
});

// 2. SAS Token Generator (The "VIP Pass" for Frontend photo uploads)
app.get('/get-upload-token', async (req, res) => {
    try {
        const result = await blobService.generateUploadUrl();
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to generate SAS token", details: err.message });
    }
});

// 3. GET All Incidents (The Dashboard Feed)
// Supports filtering by severity: /incidents?severity=Major
app.get('/incidents', async (req, res) => {
    try {
        const { severity } = req.query;
        let incidents = await cosmosService.getAllIncidents();

        if (severity) {
            incidents = incidents.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
        }

        res.json(incidents);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch incidents", details: err.message });
    }
});

// 4. GET Single Incident (Detailed View)
app.get('/incidents/:id', async (req, res) => {
    try {
        const incident = await cosmosService.getIncidentById(req.params.id);
        if (!incident) return res.status(404).json({ error: "Incident not found" });
        res.json(incident);
    } catch (err) {
        res.status(500).json({ error: "Error retrieving incident", details: err.message });
    }
});

// 5. Incident Submission (With Auto-Triage)
app.post('/submit-incident', async (req, res) => {
    try {
        const { aiResults } = req.body;
        
        const incidentData = {
            id: uuidv4(),
            ...req.body,
            status: "Submitted",
            // Automatically triage based on AI results, or default to Pending
            severity: calculateSeverity(aiResults), 
            createdAt: new Date().toISOString()
        };

        const createdItem = await cosmosService.createIncident(incidentData);
        res.status(201).json(createdItem);
    } catch (err) {
        res.status(500).json({ error: "Failed to save incident", details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Roadify Backend running on http://localhost:${PORT}`);
});