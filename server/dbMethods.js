const config = require('./config/config');
aws = require('aws-sdk');

const dynamodb = new aws.DynamoDB({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});

//Export all the function inside this module to use in server.js
module.exports = {

    //Checks whether the given TableName exists
    doesTableExist: () => {
        let params = {TableName: 'Businesses'};
        dynamodb.waitFor('tableExists', params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log("Connect to DynamoDb Successful!! :) ");
                console.log(data);           // successful response
            }
        });
    },

    //Insert a new Business to the DB
    insertNewBusiness: (param, businessID, businessName) => {

        //Enter the new business to the Businesses table
        dynamodb.updateItem(param, function (err) {
            if (err) console.log(err);
            else console.log("inserted new business to Business Table");
        });

        //Enter the businessID to the BusinessNameToID table
        let businessIdParam = {
            ExpressionAttributeNames: {"#ID": "ID"},
            ExpressionAttributeValues: {":ID": {S: businessID},},
            Key: {"BusinessName": {S: businessName}},
            ReturnValues: "ALL_NEW",
            TableName: "BusinessNameToID",
            UpdateExpression: "SET #ID = :ID"
        };
        dynamodb.updateItem(businessIdParam, function (err) {
            if (err) console.log(err);
            else console.log("inserted new ID to BusinessNameToID Table");
        });
    },

    //Update the users table when a new user scans the barcode
    //The user will be entered to the Users table for the id its his first time
    //Otherwise the new record will be added to the his visited list
    updateCustomer: (param, param2) => {
        dynamodb.updateItem(param, function (err) {
            if (err) {
                dynamodb.updateItem(param2, function (err2) {
                    if (err2) {
                        console.log("User visited list was updated");
                    } else {
                        console.log("New user was added to DB");
                    }
                })
            }
            else console.log("Persons visited list was updated");
        });
    },

    //Update the Businesses table visitors list
    //When a user enter a business the business table will records this in its visitors list
    updateBusinessVisitorsList: (param) => {
        //Enter the transaction addition to the visitors list
        dynamodb.updateItem(param, function (err) {
            if (err) {
                console.log("error in updateBusinessVisitors " + err);
            } else {
                console.log("user added to businesses visitors list")
            }
        })
    },

    //Get business ID, given Business Name we return Business ID
    getBusinessID: async (businessName) => {

        let param = {
            Key: businessName,
            ProjectionExpression: 'ID',
            TableName: "BusinessNameToID"
        };

        return await dynamodb.getItem(param, function (err, data) {
            if (err) console.log(err);
            else {
                console.log("business ID is: " + data.Item.ID.S);
            }
        }).promise();
    },

    //Update the infected table with the details of the discovered infection
    updateInfected: (param) => {
        //Update the infected table
        dynamodb.updateItem(param, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log("Infection discovered - store data - trigger lambada!");
            }
        })
    },

    //Get all Businesses name for drop down list
    getBusinesses: () => {
        let params = {TableName: "BusinessNameToID"};

        dynamodb.scan(params).eachPage((err, data) => {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            } else {
                return data.Items;
            }
        });
    }
};
