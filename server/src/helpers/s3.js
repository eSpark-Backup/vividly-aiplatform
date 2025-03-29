// Configure the S3 client using AWS SDK v2
import AWS from "aws-sdk";
let s3
if (!s3) {
    s3 = new AWS.S3({
        region: process.env.S3_REGION || 'us-east-1',
        endpoint: process.env.S3_ENDPOINT,
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        signatureVersion: "v4",
        s3ForcePathStyle: true
    });
}

const IMAGE_EXPIRY = 60 * 60 * 24 * 7; // URL expiry time in seconds (7 days)
const S3_BUCKET = process.env.S3_BUCKET;

// Update your get signed URL function
async function getSignedUrl(key, exp = IMAGE_EXPIRY) {
    const params = {
        Bucket: S3_BUCKET,
        Key: key,
        Expires: exp
    };

    return s3.getSignedUrlPromise('getObject', params);
}


export {s3, getSignedUrl}