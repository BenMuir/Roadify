const client = require('../config/cosmos-db');

const databaseId = process.env.COSMOS_DATABASE_ID || "RoadifyDB";
const containerId = process.env.COSMOS_CONTAINER_ID || "Incidents";

const database = client.database(databaseId);
const container = database.container(containerId);

const cosmosService = {
    // Save a new incident (The Data Contract)
    createIncident: async (incidentData) => {
        const { resource } = await container.items.create(incidentData);
        return resource;
    },

    // Get all incidents for the Dashboard
    getAllIncidents: async () => {
        const { resources } = await container.items
            .query("SELECT * from c ORDER BY c._ts DESC") // Using _ts (Cosmos internal timestamp) or your custom 'timestamp'
            .fetchAll();
        return resources;
    },

    // GET a single incident by ID (For the detailed view)
    getIncidentById: async (id) => {
        try {
            // In Cosmos, we use .item(id, partitionKey)
            // Since we use 'id' as the partition key, it's (id, id)
            const { resource } = await container.item(id, id).read();
            return resource;
        } catch (error) {
            // Handle cases where the ID doesn't exist
            if (error.code === 404) return null;
            throw error;
        }
    }
};

module.exports = cosmosService;