const { config } = require('dotenv');
config();
const AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.REGION
});

let s3 = new AWS.S3();

const params = {
    Bucket: process.env.BUCKET
};

const editBucketCORS = () =>
    s3.putBucketCors(
        {
            Bucket: process.env.BUCKET,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ["*"],
                        AllowedMethods: ["GET","PUT", "POST", "DELETE"],
                        AllowedOrigins: ["*"]
                    }
                ]
            }
        },
        err => {
            if (err) console.log(err, err.stack);
            else console.log(`Edit Bucket CORS succeed!`);
        }
    );

s3.createBucket(params, (err, data) => {
    if (err) {
        console.log(err);
    }else {
        console.log(data);
        console.log("Create Bucket Successfully");
        editBucketCORS();
    }
});