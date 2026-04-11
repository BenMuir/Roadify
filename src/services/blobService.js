const { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions, BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const storageAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const sharedKeyCredential = new StorageSharedKeyCredential(storageAccountName, accountKey);

const blobServiceClient = BlobServiceClient.fromConnectionString(
    `DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${accountKey};EndpointSuffix=core.windows.net`
);
const containerClient = blobServiceClient.getContainerClient(containerName);

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
    },

    uploadBase64ToBlob: async (claimId, slot, type, dataUrl) => {
        const base64Data = dataUrl.split(',')[1] || dataUrl;
        const buffer = Buffer.from(base64Data, 'base64');
        const blobName = `claims/${claimId}/${slot}-${type}.jpg`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(buffer, buffer.length, {
            blobHTTPHeaders: { blobContentType: 'image/jpeg' },
        });
        const blobUrl = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blobName}`;
        return { blobUrl, blobName };
    },
};

module.exports = blobService;
