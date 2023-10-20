const cors = require("cors");
const aws = require("aws-sdk");
const express = require("express");
const { config } = require('dotenv');
const AWS = require("aws-sdk");

config();
const app = express();
app.use(cors());

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.REGION
});
const s3 = new aws.S3();
app.get("/", (req, res)=>{
  res.sendFile(__dirname+"/index.html");
})
app.get("/sign-s3", (req, res) => {
    const fileName = req.query["file-name"];
    const fileType = req.query["file-type"];
    const s3Params = {
        Bucket: process.env.BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        //ACL: "public-read"
    };

    s3.getSignedUrl("putObject", s3Params, (err, data) => {
        if (err) {
            console.log(`getSignedUrl error: `, err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${process.env.BUCKET}.s3.amazonaws.com/${fileName}`
        };
        console.log("Success generated singed URL. For more information: " + returnData);
        res.write(JSON.stringify(returnData));
        res.end();
    });
});

app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});