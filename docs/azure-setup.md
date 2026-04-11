# Roadify — Azure Setup

## Resources

All resources live in resource group **`roadify-rg`** (Australia East).

| Resource | Type | Name |
|----------|------|------|
| Database | Cosmos DB (SQL API) | `roadify-db-akira` |
| Photo Storage | Blob Storage | `roadifystorage1` |
| Backend + Dashboard | App Service (Linux, B1) | `roadify-api-akira` |
| Driver App | Static Web App (Free) | `roadify-driver` |

## Live URLs

- **Driver App:** https://thankful-grass-0b8a37800.7.azurestaticapps.net
- **Dashboard:** https://roadify-api-akira.azurewebsites.net

## Environment Variables (App Service)

| Variable | Purpose |
|----------|---------|
| `COSMOS_ENDPOINT` | Cosmos DB connection URL |
| `COSMOS_KEY` | Cosmos DB primary key |
| `AZURE_STORAGE_ACCOUNT_NAME` | Blob Storage account name |
| `AZURE_STORAGE_ACCOUNT_KEY` | Blob Storage access key |
| `AZURE_STORAGE_CONTAINER_NAME` | Blob container (`photos`) |
| `OPENAI_API_KEY` | For async AI report generation |

## How It Was Set Up (CLI)

```bash
# Login
az login

# Resource group
az group create --name roadify-rg --location australiaeast

# Cosmos DB
az cosmosdb create --name roadify-db-akira --resource-group roadify-rg --kind GlobalDocumentDB --locations regionName=australiaeast
az cosmosdb sql database create --account-name roadify-db-akira --resource-group roadify-rg --name RoadifyDB
az cosmosdb sql container create --account-name roadify-db-akira --resource-group roadify-rg --database-name RoadifyDB --name Incidents --partition-key-path /id

# Blob Storage
az storage account create --name roadifystorage1 --resource-group roadify-rg --location australiaeast --sku Standard_LRS
az storage container create --name photos --account-name roadifystorage1

# App Service (backend + dashboard)
az appservice plan create --name roadify-plan --resource-group roadify-rg --sku B1 --is-linux
az webapp create --name roadify-api-akira --resource-group roadify-rg --plan roadify-plan --runtime "NODE:20-lts"
az webapp config set --name roadify-api-akira --resource-group roadify-rg --startup-file "node server.js"

# Static Web App (driver app)
az staticwebapp create --name roadify-driver --resource-group roadify-rg --location eastasia --sku Free
```

## Deploying Updates

**Backend:**
```bash
cd /tmp/roadify-backend
az webapp up --name roadify-api-akira --resource-group roadify-rg --plan roadify-plan --runtime "NODE:20-lts"
```

**Driver App:**
```bash
cd driver-app
npm run build
SWA_TOKEN=$(az staticwebapp secrets list --name roadify-driver --resource-group roadify-rg --query 'properties.apiKey' -o tsv)
npx @azure/static-web-apps-cli deploy ./dist --deployment-token "$SWA_TOKEN" --env production
```

## Local Development

Set `VITE_API_URL=http://localhost:3000` in `driver-app/.env` and run the backend without Azure env vars — it falls back to local JSON file DB and local photo storage automatically.
