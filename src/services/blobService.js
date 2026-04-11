const { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const sharedKeyCredential = new StorageSharedKeyCredential(
    storageAccountName,
    process.env.AZURE_STORAGE_ACCOUNT_KEY
);

const blobService = {
    generateUploadUrl: async (claimId, filename) => {
        const blobName = claimId && filename
            ? `claims/${claimId}/${filename}`
            : `incident-${uuidv4()}.jpg`;

        const sasToken = generateBlobSASQueryParameters({
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse("cw"),
            startsOn: new Date(),
            expiresOn: new Date(new Date().valueOf() + 3600 * 1000),
        }, sharedKeyCredential).toString();

        const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}`;
        const uploadUrl = `${blobUrl}?${sasToken}`;

        return { uploadUrl, blobUrl, blobName };
    },

    generateBatchUploadUrls: async (claimId, photoManifest) => {
        const results = [];
        for (const entry of photoManifest) {
            const { slot, type } = entry;
            const filename = `${slot}-${type}.jpg`;
            const result = await blobService.generateUploadUrl(claimId, filename);
            results.push({ slot, type, ...result });
        }
        return results;
    }
};

module.exports = blobService;
