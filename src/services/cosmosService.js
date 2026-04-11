const client = require('../config/cosmos-db');

const databaseId = process.env.COSMOS_DATABASE_ID || "RoadifyDB";
const containerId = process.env.COSMOS_CONTAINER_ID || "Incidents";

const database = client.database(databaseId);
const container = database.container(containerId);

const cosmosService = {
    // Save a new incident
    createIncident: async (incidentData) => {
        const { resource } = await container.items.create(incidentData);
        return resource;
    },

    // Get all incidents for the Dashboard
    getAllIncidents: async () => {
        try {
            // Using _ts (System Timestamp) ensures EVERY document shows up,
            // even if 'createdAt' or 'timestamp' is missing in some test data.
            const { resources } = await container.items
                .query("SELECT * FROM c ORDER BY c._ts DESC")
                .fetchAll();
            return resources;
        } catch (error) {
            console.error("Cosmos Query Error:", error.message);
            throw error;
        }
    },

    // GET a single incident by ID
    getIncidentById: async (id) => {
        try {
            const { resource } = await container.item(id, id).read();
            return resource;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    },

    updateIncident: async (id, updates) => {
        try {
            const { resource: existing } = await container.item(id, id).read();
            if (!existing) return null;
            const updated = { ...existing, ...updates };
            const { resource } = await container.item(id, id).replace(updated);
            return resource;
        } catch (error) {
            console.error('Cosmos update error:', error.message);
            throw error;
        }
    },

    deleteIncident: async (id) => {
        try {
            await container.item(id, id).delete();
            return true;
        } catch (error) {
            if (error.code === 404) return false;
            throw error;
        }
    }
};

module.exports = cosmosService;