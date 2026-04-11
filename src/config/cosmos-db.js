const { CosmosClient } = require("@azure/cosmos");
require('dotenv').config();

const endpoint = process.env.COSMOS_ENDPOINT; 
const key = process.env.COSMOS_KEY;

if (!endpoint || !key) {
    console.error("❌ Error: COSMOS_ENDPOINT or COSMOS_KEY is missing in .env");
    process.exit(1);
}

const client = new CosmosClient({ endpoint, key });

module.exports = client;