const fs = require('fs');
const path = require('node:path');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    endpoint: 's3.twcstorage.ru',
    accessKeyId: "SLCKQLRWIRZQJ2T8TKUO",
    secretAccessKey: "BpBCIkQ60LJ2OlZKCjcMBho1VkyLXNnmGHGJGMEQ",
    s3ForcePathStyle: true,
    httpOptions: {
        timeout: 300000,
        connectTimeout: 30000,
    },
    maxRetries: 5,
});

async function uploadToS3(filePath, bucketName) {
    if (!filePath || !bucketName) {
        return Promise.reject(new Error("Не указан filePath или bucketName"));
    }

    if (!fs.existsSync(filePath)) throw new Error(`Файл не найден: ${filePath}`);

    const fileStream = fs.createReadStream(filePath);
    const key = path.basename(filePath);

    try {
        const uploaded = await s3.upload({
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
        }, {
            partSize: 10 * 1024 * 1024,
            queueSize: 1
        }).promise();
        return uploaded.Location;
    } catch (error) {
        throw error;
    }
}

module.exports = {uploadToS3};