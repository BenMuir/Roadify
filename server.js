const path = require('path');
const express = require('express');
const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const devWithoutCosmos = ['1', 'true', 'yes'].includes(
    String(process.env.DEV_WITHOUT_COSMOS || '').toLowerCase()
);

if (!devWithoutCosmos) {
    const requiredEnv = ['COSMOS_CONNECTION_STRING', 'COSMOS_DATABASE_ID', 'COSMOS_CONTAINER_ID'];
    const missingEnv = requiredEnv.filter((k) => !process.env[k] || !String(process.env[k]).trim());
    if (missingEnv.length) {
        console.error(
            'Missing or empty env: ' +
                missingEnv.join(', ') +
                '\nEither add them in a .env file (see .env.example), or set DEV_WITHOUT_COSMOS=1 to run locally without Azure Cosmos (in-memory data only).'
        );
        process.exit(1);
    }
}

const PORT = Number(process.env.PORT) || 3000;

/** In-memory incidents when DEV_WITHOUT_COSMOS=1 (cleared on restart). */
const memoryIncidents = [];

let container = null;
if (!devWithoutCosmos) {
    const { CosmosClient } = require('@azure/cosmos');
    const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
    const database = client.database(process.env.COSMOS_DATABASE_ID);
    container = database.container(process.env.COSMOS_CONTAINER_ID);
} else {
    console.warn(
        'DEV_WITHOUT_COSMOS: no Azure Cosmos — using in-memory store (data is lost when you stop the server).'
    );
    const t = Date.now();
    memoryIncidents.push(
        {
            id: 'seed-local-1',
            driverName: 'Alex Morgan',
            vehicleRego: 'ABC123',
            location: 'Depot — sample row (local memory)',
            status: 'Submitted',
            severity: 'Low',
            createdAt: new Date(t - 7200000).toISOString()
        },
        {
            id: 'seed-local-2',
            driverName: 'Sam Taylor',
            vehicleRego: 'XYZ789',
            location: 'M2 exit 14 — sample row (local memory)',
            status: 'Submitted',
            severity: 'Pending',
            createdAt: new Date(t - 3600000).toISOString()
        }
    );
}

const app = express();

app.use((req, res, next) => {
    const origin = req.headers.origin;
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// SAS Token Generator (The "VIP Pass" for the Frontend)
app.get('/get-upload-token', async (req, res) => {
    try {
        const blobName = `incident-${uuidv4()}.jpg`; // Unique name for the upcoming photo
        const sharedKeyCredential = new StorageSharedKeyCredential(
            "roadifystoragebm", // Your Storage Account Name
            "YOUR_ACCOUNT_KEY" // Found in 'Keys' tab in Azure
        );

        const sasToken = generateBlobSASQueryParameters({
            containerName: process.env.AZURE_STORAGE_CONTAINER_NAME,
            blobName: blobName,
            permissions: BlobSASPermissions.parse("cw"), // c=create, w=write
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // Valid for 1 hour
        }, sharedKeyCredential).toString();

        const uploadUrl = `https://roadifystoragebm.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${blobName}?${sasToken}`;
        
        // Send back the URL the Frontend will 'PUT' the file to
        res.json({ uploadUrl, blobName });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/submit-incident', async (req, res) => {
    try {
        const incidentData = {
            id: uuidv4(),
            ...req.body,
            status: 'Submitted',
            severity: 'Pending',
            createdAt: new Date().toISOString()
        };

        if (devWithoutCosmos) {
            memoryIncidents.push(incidentData);
            return res.status(201).json(incidentData);
        }

        const { resource: createdItem } = await container.items.create(incidentData);
        res.status(201).json(createdItem);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

function sortIncidentsByCreatedDesc(items) {
    return items.slice().sort((a, b) => {
        const ta = a.createdAt ? String(a.createdAt) : '';
        const tb = b.createdAt ? String(b.createdAt) : '';
        return tb.localeCompare(ta);
    });
}

async function listIncidents(req, res) {
    try {
        const raw = parseInt(String(req.query.limit ?? '50'), 10);
        const limit = Math.min(Math.max(Number.isFinite(raw) ? raw : 50, 1), 100);

        if (devWithoutCosmos) {
            const sorted = sortIncidentsByCreatedDesc(memoryIncidents);
            return res.json(sorted.slice(0, limit));
        }

        const { resources } = await container.items
            .query({ query: 'SELECT * FROM c' })
            .fetchAll();
        const sorted = sortIncidentsByCreatedDesc(resources);
        res.json(sorted.slice(0, limit));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

app.get('/incidents', listIncidents);
app.get('/api/incidents', listIncidents);

app.listen(PORT, () => console.log(`Roadify Backend running on port ${PORT}`));