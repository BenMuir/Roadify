const express = require('express');
const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Initialize Cosmos DB
const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const database = client.database(process.env.COSMOS_DATABASE_ID);
const container = database.container(process.env.COSMOS_CONTAINER_ID);

// 2. SAS Token Generator (The "VIP Pass" for the Frontend)
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

// 3. Incident Submission (The Data Contract)
app.post('/submit-incident', async (req, res) => {
    try {
        const incidentData = {
            id: uuidv4(), // Cosmos DB loves an 'id' field
            ...req.body, // This will include driverName, vehicleRego, location, etc.
            status: "Submitted",
            severity: "Pending", // To be updated by our ML Engineer later
            createdAt: new Date().toISOString()
        };

        const { resource: createdItem } = await container.items.create(incidentData);
        res.status(201).json(createdItem);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(process.env.PORT, () => console.log(`Roadify Backend running on port ${process.env.PORT}`));