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

export {s3}