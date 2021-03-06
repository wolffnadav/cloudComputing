//Express configurations
const express = require('express');
const app = express();
const port = 3000;

//Other configurations
const config = require('./config/config');
const db = require('./dbMethods');
const bodyParser = require('body-parser');
const {v4: uuidV4} = require('uuid');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
}); // Cross Origin middleware

//Aws configuration
aws = require('aws-sdk');

//Connection to dynamoDB on aws
const dynamoDB = new aws.DynamoDB({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});
//Connection to S3 bucket
const s3 = new aws.S3({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});
//Connection to the step function on aws that triggers the infection notice SMS to users
const stepFunctions = new aws.StepFunctions({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});

//Rest for check the server status
app.post('/api/ping', function (req, res) {
    console.log('Ping from Angular works!');
    res.send({
        "statusCode": "200",
        "body": "Ping"
    });
});

//Business signs up for our service for the first time
//This will add the new business to our Businesses table in dynamoDB
app.post('/api/insertNewBusiness', function (req, res) {
    let newID = uuidV4();
    let insertNewBusinessParam = {
        ExpressionAttributeNames: {
            "#F": "Infected",
            "#N": "Name",
            "#V": "Visitors",
            "#A": "Address",
            "#T": "Type",
            "#VL": "VisitorsList"
        },
        ExpressionAttributeValues: {
            ":F": {N: "0"},
            ":N": {S: req.body.businessname},
            ":T": {S: req.body.type},
            ":V": {N: "0"},
            ":A": {S: req.body.address},
            ":VL": {L: [{SS: ["dummy", "dummy2"]}]}
        },
        Key: {"ID": {S: newID.toString()}},
        ReturnValues: "ALL_NEW",
        TableName: "Businesses",
        UpdateExpression: "SET #F = :F, #N = :N, #V = :V, #A = :A, #VL = :VL, #T = :T"
    };
    db.insertNewBusiness(insertNewBusinessParam, newID, req.body.businessname);

    res.send({
        "statusCode": "200"
    });
});

//person uses our service, this will enter the person to the DB if that is his first use or add a new entry to his Visited list
//also the Business table will be updated with this visit to their place
app.post('/api/insertNewPerson', function (req, res) {
    //query Business table to find the Business ID
    function getBusinessIDAndUpdateCustomers(businessName, userName, email, phoneNumber) {
        //get business ID
        let param = {
            TableName: "BusinessNameToID",
            Key: {"BusinessName": {"S": businessName}},
            ProjectionExpression: 'ID'
        };
        dynamoDB.getItem(param, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                // update the customer table with this transaction
                let timeStamp = new Date().getTime().toString();
                let businessID = data.Item.ID.S;
                updateCustomer(businessID, userName, email, phoneNumber, timeStamp);

                //now enter the user to the Business Visitors list as well
                let updateBusinessVisitorListParam = {
                    ExpressionAttributeNames: {
                        // "#F": "Infected",
                        // "#N": "Name",
                        // "#V": "Visitors",
                        // "#A": "Address",
                        "#VL": "VisitorsList"
                    },
                    ExpressionAttributeValues: {
                        // ":F": {N: "0"},
                        // ":N": {S: req.body.businessName},
                        // ":V": {N: "0"},
                        // ":A": {S: req.body.address},
                        ":VL": {L: [{SS: [timeStamp, phoneNumber]}]}
                    },
                    Key: {"ID": {S: businessID}},
                    ReturnValues: "ALL_NEW",
                    TableName: "Businesses",
                    UpdateExpression: "SET #VL = list_append(#VL, :VL)"
                };
                db.updateBusinessVisitorsList(updateBusinessVisitorListParam);
            }
        });
    }

    //update the customer table with the businessID
    function updateCustomer(businessID, userName, email, phoneNumber, timeStamp) {

        let updateVisitedListParam = {
            ExpressionAttributeNames: {
                "#E": "Email",
                "#N": "Name",
                "#V": "Visited"
            },
            ExpressionAttributeValues: {
                ":V": {L: [{SS: [timeStamp, businessID]}]},
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
                ":V": {L: [{SS: [timeStamp, businessID]}]},
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

// user noticed that he got infected - this will send an alert to all users who are in risk
// This function first adds the infected user to Infected Table and then it triggers a step function
// made of 2 lambda function in python on AWS
app.post('/api/sendInfectedAlert', function (req, res) {
    // enter the infected user to the infected table to trigger the lambada function that sends all the users in danger SMS
    //convert milliseconds to date
    let date = new Date(parseInt(req.body.dateOfNotice)).getTime().toString();
    let phoneNumber = req.body.phoneNumber;

    //entered the notice to the infected table
    let updateInfectedTable = {
        ExpressionAttributeNames: {"#D": "Date"},
        ExpressionAttributeValues: {":D": {S: date}},
        Key: {"PhoneNumber": {S: phoneNumber}},
        TableName: "Infected",
        UpdateExpression: "SET #D = :D"
    };

    //update infected table
    db.updateInfected(updateInfectedTable);

    //payload to step function - this info is needed to find the user who are in danger
    let message = {
        PhoneNumber: phoneNumber,
        date: date
    };

    let params = {
        stateMachineArn: 'arn:aws:states:eu-west-1:257606365727:stateMachine:send-warning-setpfunction',
        input: JSON.stringify(message)
    };

    //trigger to the AWS step function
    stepFunctions.startExecution(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });

    //send response back to front end
    res.send({
        "statusCode": "200"
    });
});

//Get all Businesses Names for the drop down list in the register-person page
app.get('/api/getBusinessesNames', function (req, res) {
    //step 1 - get Business name and ID by a promise
    const getBusinessData = new Promise((resolve, reject) => {
        dynamoDB.scan({TableName: "BusinessNameToID"}).eachPage((err, data) => {
            if (err) {
                reject(console.error("Unable to query. Error:", JSON.stringify(err, null, 2)));
            } else {
                if (data != null) resolve(data.Items);
            }
        })
    });

    //step 2 - with these values create a param and send back to front end
    getBusinessData.then(resolve => {
        let bodyParam = [];
        let i = 0;
        resolve.forEach(element => {
            bodyParam.push({
                "name": element.BusinessName.S,
                "id_table": element.ID.S,
                "id": i
            })
            i++;
        })
        return bodyParam;
        //step 3 - send back the data to the front end
    }).then(resolve => {
        res.send({
            "statusCode": "200",
            "body": resolve
        })
    }).catch(reject => {
        console.log("error in getBusinessesNames")
        console.log(reject);
    });
});

//Get QR barcode image from s3 bucket, this pops up after registration of a user in the register-person page
app.get('/api/getQrImage', function (req, res) {
    let params = {
        Bucket: "final-project-cloud",
    };
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            let imagesUrlArray = [];
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