const { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
// Use the account key (Found in Azure Portal -> Access Keys)
const sharedKeyCredential = new StorageSharedKeyCredential(
    storageAccountName,
    process.env.AZURE_STORAGE_ACCOUNT_KEY 
);

const blobService = {
    generateUploadUrl: async () => {
        const blobName = `incident-${uuidv4()}.jpg`;
        
        const sasToken = generateBlobSASQueryParameters({
            containerName: containerName,
            blobName: blobName,
            permissions: BlobSASPermissions.parse("cw"), // Create and Write permissions
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour expiry
        }, sharedKeyCredential).toString();

        const uploadUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
        
        return { uploadUrl, blobName };
    }
};

module.exports = blobService;