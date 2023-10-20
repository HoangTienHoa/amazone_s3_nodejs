const AWS = require("aws-sdk");
const fs = require("fs");
const { config } = require('dotenv');
config();
const localImage = "./commingsoon2.jpg";
const imageRemoteName = `directUpload_commingsoon2_${new Date().getTime()}.jpg`;
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.REGION
});

let s3 = new AWS.S3();

s3.putObject({
    Bucket: process.env.BUCKET,
    Body: fs.readFileSync(localImage),
    Key: imageRemoteName
})
    .promise()
    .then(res => {
        console.log(`Upload succeeded - `, res);
    })
    .catch(err => {
        console.log("Upload failed:", err);
    });
