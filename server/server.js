//express configurations
const express = require('express');
const app = express();
const port = 3000;

//other configurations
const bodyParser = require('body-parser');
const db = require('./dbMethods');
const {v4: uuidV4} = require('uuid');

//aws configuration
const config = require('./config/config');
aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});

const s3 = new aws.S3({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/api/ping', function (req, res) {
    console.log('Ping from Angular works!');
    res.send({
        "statusCode": "200",
        "body": "Ping"
    });
});


//business signs up for our service for the first time, this will add the business to our Business table in dynamoDB
app.post('/api/insertNewBusiness', function (req, res) {
    let newID = uuidV4();
    let insertNewBusinessParam = {
        ExpressionAttributeNames: {
            "#F": "Infected",
            "#N": "Name",
            "#V": "Visitors",
            "#A": "Address"
        },
        ExpressionAttributeValues: {
            ":F": {N: "0"},
            ":N": {S: req.body.businessname},
            ":V": {N: "0"},
            ":A": {S: req.body.address}
        },
        Key: {"ID": {S: newID.toString()}},
        ReturnValues: "ALL_NEW",
        TableName: "Businesses",
        UpdateExpression: "SET #F = :F, #N = :N, #V = :V, #A = :A"
    };
    db.insertNewBusiness(insertNewBusinessParam, newID, req.body.businessname);

    res.send({
        "statusCode": "200"
    });
});


//person uses our service, this will enter the person to the DB if that is his first use or add a new entry to his Visited list
//TODO currently if business entered is not in Business table this throws an error
app.post('/api/insertNewPerson', function (req, res) {
    //query Business table to find the Business ID
    function getBusinessIDAndUpdateCustomers(businessName, userName, email, phoneNumber) {
        //get business ID
        let param = {
            TableName: "BusinessNameToID",
            Key: {"BusinessName": {"S": businessName}},
            ProjectionExpression: 'ID'
        };
        dynamodb.getItem(param, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                let businessID = data.Item.ID.S;
                updateCustomer(businessID, userName, email, phoneNumber);
            }
        });
    }

    //update the customer table with the businessID
    function updateCustomer(businessID, userName, email, phoneNumber) {
        let timeStamp = new Date().toString();

        let updateVisitedListParam = {
            ExpressionAttributeNames: {
                "#E": "Email",
                "#N": "Name",
                "#V": "Visited"
            },
            ExpressionAttributeValues: {
                ":V": {L: [{SS: [businessID, timeStamp]}]},
                ":N": {S: userName},
                ":E": {S: email}
            },
            Key: {"PhoneNumber": {S: phoneNumber}},
            TableName: "Users",
            UpdateExpression: "SET #V = list_append(#V, :V), #N = :N, #E = :E"
        };

        let insertNewPersonParam = {
            ExpressionAttributeNames: {
                "#E": "Email",
                "#N": "Name",
                "#V": "Visited"
            },
            ExpressionAttributeValues: {
                ":V": {L: [{SS: [businessID, timeStamp]}]},
                ":N": {S: userName},
                ":E": {S: email}
            },
            Key: {"PhoneNumber": {S: phoneNumber}},
            TableName: "Users",
            UpdateExpression: "SET #V = :V, #N = :N, #E = :E"
        };

        //this update has two parameters, depending on the case it uses one of them
        //after update is done another callback function is called to send back the 200 response
        db.updateCustomer(updateVisitedListParam, insertNewPersonParam);
    }

    //this called the two functions above it first gets the BusinessID by querying the BusinessNameToID table
    //and after this is done, it uses a callback function to update the Users table
    getBusinessIDAndUpdateCustomers(req.body.business, req.body.username, req.body.email, req.body.number, updateCustomer());
    res.send({
        "statusCode": "200"
    })
});


//user noticed that he got infected - this will send an alert to all users who are in risk
//TODO
app.post('/api/sendInfectedAlert', function (req, res) {
    //find in which restaurants our user was during his infectious time
    //TODO

    //send a text message to all users that were in the same places our infectious user was
    //TODO

});

//Get all Businesses Names for drop down list
app.get('/api/getBusinessesNames', function (req, res) {
    //todo make it work asynchron and change exampleBody with businesses
    let businesses = db.getBusinesses();
    let exampleBody = [{
        "name": "pizza hut",
        "id_table": "f47117d0-7f62-4b90-9e5d-222003938bab"
    }, {
        "name": "in and out burgers",
        "id_table": "f7bc8bc7-0000-4b09-a607-b416672e8a0f"
    }, {
        "name": "in and out",
        "id_table": "3eab512e-c484-4fb7-905b-ce6694268a02"
    }, {
        "name": "dddd",
        "id_table": "f8894bea-61d9-4b9d-9b4e-d8c7989ce411"
    }, {
        "name": "burger place",
        "id_table": "ed868522-15d8-453e-854f-4787e8b97988"
    }];
    let i = 0;
    exampleBody.forEach(it => {
        it['id'] = i;
        i++;
    });


    res.send({
        "statusCode": "200",
        "body": exampleBody
        // "body": businesses


    });
});

//Get QR barcose image from s3 bucket
app.get('/api/getQrImage', function (req, res) {
    var params = {
        Bucket: "final-project-cloud",
    };
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            imagesUrlArray = [];
            data.Contents.forEach(image => {
                imagesUrlArray.push(s3.getSignedUrl('getObject', {
                    Bucket: "final-project-cloud",
                    Key: image.Key,
                    Expires: 100
                }));
            });
            res.send(
                {
                    "statusCode": "200",
                    "images": imagesUrlArray
                })
        }
    });
});


app.listen(port, () => console.log(`app listening at http://localhost:${port}`));
