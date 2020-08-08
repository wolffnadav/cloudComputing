const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const db = require('./dbMethods');
const { v4 : uuidV4 } = require('uuid');

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
app.post('/api/insertNewBusiness', async function (req, res) {
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
app.post('/api/insertNewPerson', async function (req, res) {
    //query Business table to find the Business ID
    let businessID = await db.getBusinessID(req.body.business);
    businessID = businessID.Item.ID.S;
    let timeStamp = new Date().toString();

    let updateVisitedListParam = {
        ExpressionAttributeNames: {
            "#E": "Email",
            "#N": "Name",
            "#V": "Visited"
        },
        ExpressionAttributeValues: {
            ":V": { L: [{ SS: [timeStamp, businessID ] } ] },
            ":N": { S: req.body.username},
            ":E": { S: req.body.email } },
        Key: { "PhoneNumber": { S: req.body.number } },
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
            ":V": { L: [{ SS: [businessID, timeStamp ] } ] },
            ":N": { S: req.body.username},
            ":E": { S: req.body.email } },
        Key: { "PhoneNumber": { S: req.body.number } },
        TableName: "Users",
        UpdateExpression: "SET #V = :V, #N = :N, #E = :E"
    };

    db.updateCustomer(updateVisitedListParam, insertNewPersonParam);

    res.send({
        "statusCode": "200"
    });
});

app.listen(port, () => console.log(`app listening at http://localhost:${port}`));