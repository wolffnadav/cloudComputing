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
    isTableExist: () => {
        let params = { TableName: 'Businesses' };
        dynamodb.waitFor('tableExists', params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log("Connect to DynamoDb Successful!! :) ");
                console.log(data);           // successful response
            }
        });
    },


    //insert a new Business to the DB or if the business is in the DB we update only the Customer list
    insertNewBusiness: (param, businessID, businessName) => {

        //enter the new business to the Businesses table
        dynamodb.updateItem(param, function (err) {
            if (err) console.log(err);
            else console.log("inserted new business");           // successful response
        });

        //enter the businessID to the BusinessNameToID
        let param2 = {
            ExpressionAttributeNames: {
                "#ID": "ID"
            },
            ExpressionAttributeValues: {
                ":ID": {S: businessID},
            },
            Key: {"BusinessName": {S: businessName}},
            ReturnValues: "ALL_NEW",
            TableName: "BusinessNameToID",
            UpdateExpression: "SET #ID = :ID"
        };

        dynamodb.updateItem(param2, function (err) {
            if (err) console.log(err);
            else console.log("inserted new ID to BusinessNameToID");       // successful response
        });


    },


    // update the users table, if a new user scans the barcode he will be entered to the Users table for the first time
    // otherwise the new barcode scan will be added to the Visited list
    updateCustomer: (param, param2) => {

        dynamodb.updateItem(param, function (err, data) {
            if (err) {
                dynamodb.updateItem(param2, function (err, data) {
                    if (err) console.log(err);
                    else console.log(data);
                })
            }
            else console.log(data);           // successful response
        });

    },


    //get business ID, given Business Name we return Business ID
    //TODO
    getBusinessID: (businessName)=> {
        let param = {
            TableName : "BusinessNameToID",
            KeyConditionExpression: "#Name = :Name",
            ExpressionAttributeNames:{
                "#Name": "BusinessName"
            },
            ExpressionAttributeValues: {
                ":Name": businessName
            }
        };
        let businessID = dynamodb.query(param, function(err, data){
            if(err) console.log(err);
            else {return data}
        })
        return businessID
        // return 'd2bbe0cc-0166-4c57-92c5-ababf16218d5'
    },


    //send a notification to all users how got infected that they are in risk and should be quarantine
    updateInfected: (param) => {
            //TODO all the things
        }
}
;
