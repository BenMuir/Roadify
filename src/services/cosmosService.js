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
            .query("SELECT * from c ORDER BY c.timestamp DESC")
            .fetchAll();
        return resources;
    }
};

module.exports = cosmosService;