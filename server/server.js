const express = require('express');
const app = express();
const port = 3000;
bodyParser = require('body-parser');
const { db } = require('./dbMethods');
const { v4 : uuidV4 } = require('uuid');
const { config } = require('./config/config');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/api/ping', function (req, res) {
    console.log('Ping from Angular works!');
    res.send({
        "statusCode": "200",
        "body": "Ping"
    });
});

app.post('/api/insertNewBusiness', async function (req, res) {
    console.log('insertNewBusiness Starting...');
    let newID = uuid();
    let insertNewBusinessParam = {
        ExpressionAttributeNames: {
            "#F": "Infected",
            "#N": "Name",
            "#V": "Visitors",
            "#A": "Address"
        },
        ExpressionAttributeValues: {
            ":F": {N: "0"},
            ":N": {S: req.body.name},
            ":V": {N: "0"},
            ":A": {S: req.body.address}
        },
        Key: {"ID": {N: newID.toString()}},
        ReturnValues: "ALL_NEW",
        TableName: "Businesses",
        UpdateExpression: "SET #F = :F, #N = :N, #V = :V, #A = :A"
    };
    db.insertNewBusiness(insertNewBusinessParam);
    res.send({
        "statusCode": "200"
    });
    console.log('insertNewBusiness Finished...');
});

app.listen(port, () => console.log(`app listening at http://localhost:${port}`));