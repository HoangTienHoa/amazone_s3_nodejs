const cors = require("cors");
const aws = require("aws-sdk");
const express = require("express");
const { config } = require('dotenv');
const AWS = require("aws-sdk");
const path = require('path');
const fs = require('fs');
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
    };

    s3.getSignedUrl("putObject", s3Params, (err, data) => {
        if (err) {
            console.log(err);
            return res.sendStatus(503);
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

app.get("/getObjectList", (req, res) => {
    let params = {
        Bucket: process.env.BUCKET,
        Prefix: ''
    }
    s3.listObjects(params, function (err, data) {
        if(err){
            console.log(err);
            return res.sendStatus(503);
        }
        let objectList ="" ;
        for(let object of data.Contents) {
            objectList = objectList.concat(buildTr(object.Key));
        }
        res.send(objectList);
    });
});
const buildTr = (key)=> `<div id ="${key}">${key}<input type="button" value="Download" onClick="downloadObject('${key}')"><input type="button" value="Delete" onClick="deleteObject('${key}')"></br>`;

app.get("/downloadObject", (req, res) => {
    let params = {
        Bucket: process.env.BUCKET,
        Key: req.query.key
    }
    s3.getObject(params, function (err, data) {
          if(err){
              console.log(err);
              return res.sendStatus(503);
          }
          console.log(`Get ${params.Key} successfully`);
          res.attachment(params.Key);
          res.send(data.Body);
      });
});

app.delete("/deleteObject", (req, res) => {
    let params = {
        Bucket: process.env.BUCKET,
        Key: req.query.key
    }
    s3.deleteObject(params, function(err, data) {
        if(err){
            console.log(err);
            return res.sendStatus(503);
        }
        console.log(`Delete ${params.Key} successfully`);
        res.send(`Delete ${params.Key} successfully`);
    });
});
app.delete("/deleteAllObject", (req, res) => {
    let params = {
        Bucket: process.env.BUCKET,
        Prefix: ''
    }
    s3.listObjects(params, function (err, data) {
        if(err){
            console.log(err);
            return res.sendStatus(503);
        }
        let Objects =[] ;
        for(let object of data.Contents) {
            Objects.push({"Key":object.Key});
        }

        let deleteParams = {
            Bucket: process.env.BUCKET,
            Delete: {Objects}
        }
        console.log(JSON.stringify( deleteParams));
        s3.deleteObjects(deleteParams, function(err, data) {
            if(err) {
                console.log(err);
                return res.sendStatus(503);
            }
            console.log(`Delete All Object Successfully`);
            res.send('Delete All Object Successfully');
         });
    });
});
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});