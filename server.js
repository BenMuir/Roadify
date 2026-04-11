const express = require('express');
const cors = require('cors'); // Essential for PWA communication
const cosmosService = require('./src/services/cosmosService');
const blobService = require('./src/services/blobService');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors()); // Enable CORS so the React PWA can talk to this server
app.use(express.json());

const PORT = process.env.PORT || 3000;

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

// 3. Incident Submission (Fulfilling the Data Contract)
app.post('/submit-incident', async (req, res) => {
    try {
        const incidentData = {
            id: uuidv4(), // Cosmos DB required unique ID
            ...req.body,  // Includes driverName, vehicleRego, location, insurancePolicy, etc.
            status: "Submitted",
            severity: "Pending", // To be updated by AI  later
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