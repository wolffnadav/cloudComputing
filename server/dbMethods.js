const config = require('./config/config');
aws = require('aws-sdk');

var dynamodb = new aws.DynamoDB({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});

var params = {
    TableName: 'Businesses' /* required */
};

module.exports = {
    isTableExist: () => {
        dynamodb.waitFor('tableExists', params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log("Connect to DynamoDb Successful!! :) ");
                console.log(data);           // successful response
            }
        });
        return "nadav";
    },
    insertNewPerson: () => {

    }

};
