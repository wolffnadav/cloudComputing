const config = require('./config/config');
aws = require('aws-sdk');

const dynamodb = new aws.DynamoDB({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});

//export all the function inside this module
module.exports = {

    //Checks whether the given TableName exists
    // isTableExist: () => {
    //     let params = { TableName: 'Businesses' };
    //     dynamodb.waitFor('tableExists', params, function (err, data) {
    //         if (err) console.log(err, err.stack); // an error occurred
    //         else {
    //             console.log("Connect to DynamoDb Successful!! :) ");
    //             console.log(data);           // successful response
    //         }
    //     });
    // },


    //insert a new Business to the DB or if the business is in the DB we update only the Customer list
    insertNewBusiness: (param, businessID, businessName) => {

        //enter the new business to the Businesses table
        dynamodb.updateItem(param, function (err) {
            if (err) console.log(err);
            else console.log("inserted new business to Business Table");           // successful response
        });

        //enter the businessID to the BusinessNameToID
        let param2 = {
            ExpressionAttributeNames: {"#ID": "ID"},
            ExpressionAttributeValues: {":ID": {S: businessID},},
            Key: {"BusinessName": {S: businessName}},
            ReturnValues: "ALL_NEW",
            TableName: "BusinessNameToID",
            UpdateExpression: "SET #ID = :ID"
        };

        dynamodb.updateItem(param2, function (err) {
            if (err) console.log(err);
            else console.log("inserted new ID to BusinessNameToID Table");       // successful response
        });
    },


    //update the Business table visitors list, this when a user enter a business the business table records this in it visitors list
    updateBusinessVisitorsList: (param) => {
        //enter the transaction to the users list
        dynamodb.updateItem(param, function(err){
            if(err) {
                console.log("error in updateBusinessVisitors " + err);
            } else {
                console.log("user added to businesses visitors list")
            }
        })
    },


    // update the users table, if a new user scans the barcode he will be entered to the Users table for the first time
    // otherwise the new barcode scan will be added to the Visited list
    updateCustomer: (param, param2) => {
        dynamodb.updateItem(param, function (err) {
            if (err) {
                dynamodb.updateItem(param2, function (err2) {
                    if (err2) {
                        console.log("weird error in updateCustomer - look into this later");
                        //Todo it first dose the inner function this is the error..
                    } else {
                        console.log("new user was added to DB");
                    }
                })
            }
            else console.log("Persons visited list was updated");
        });
    },

    // get business ID, given Business Name we return Business ID
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


    //update the infected table with the details of the discovered infection
    // this will trigger a lambada that sends SMS to all users who may be in risk and should be quarantine
    updateInfected: (param) => {
        //TODO - this should be a lambada function on AWS
        dynamodb.updateItem(param, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log("Infection discovered - store data - trigger lambada!");
            }
        })
    },

    // Get all BusinessName for drop down list
    getBusinesses: () => {
        let params = {TableName: "BusinessNameToID"};

        dynamodb.scan(params).eachPage((err, data) => {
            if (err) {
                console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            } else {
                return data.Items;
            }
        });
    },


};
