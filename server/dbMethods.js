const config = require('./config/config');
aws = require('aws-sdk');

var dynamodb = new aws.DynamoDB({
    signatureVersion: 'v4',
    region: config.region,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey
});

//export all the function inside this module
module.exports = {
    //Checks whether the given TableName exists
    isTableExist: () => {
        let params = {
            TableName: 'Businesses' /* required */
        };
        dynamodb.waitFor('tableExists', params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log("Connect to DynamoDb Successful!! :) ");
                console.log(data);           // successful response
            }
        });
    },

    //insert a new Business to the DB or if the business is in the DB we update only the Customer list
    insertNewBusiness: (param) => {
        param = {
            ExpressionAttributeNames: {
                "#C": "Customers",
                "#F": "Infected",
                "#N": "Name",
                "#V": "Visitors",
                "#A": "Address"
            },
            ExpressionAttributeValues: {
                ":C": {
                    L: [{
                        SS: [
                            "0544444",
                            "6.10.2020 15:54:55"
                            ]
                        }
                        ]
                },
                ":F": {
                    N: "1"
                },
                ":N": {
                    S : "Nadav2"
                },
                ":V": {
                    N: "0"
                },
                ":A": {
                    S: "Rosh Haayin"
                }
            },
            Key: {
                "ID": {
                    N: "3"
                }
            },
            ReturnValues: "ALL_NEW",
            TableName: "Businesses",
            UpdateExpression: "SET #C = list_append(#C, :C), #F = :F, #N = :N, #V = :V, #A = :A"
        };

        dynamodb.updateItem(param, function(err, data) {
            if (err){
                param2 = {
                    ExpressionAttributeNames: {
                        "#C": "Customers",
                        "#F": "Infected",
                        "#N": "Name",
                        "#V": "Visitors",
                        "#A": "Address"
                    },
                    ExpressionAttributeValues: {
                        ":C": {
                            L: [{
                                SS: [
                                    "0544444",
                                    "6.8.2020 14:54:55"
                                ]
                            }
                            ]
                        },
                        ":F": {
                            N: "1"
                        },
                        ":N": {
                            S : "Nadav2"
                        },
                        ":V": {
                            N: "0"
                        },
                        ":A": {
                            S: "Rosh Haayin"
                        }
                    },
                    Key: {
                        "ID": {
                            N: "3"
                        }
                    },
                    ReturnValues: "ALL_NEW",
                    TableName: "Businesses",
                    UpdateExpression: "SET #C = :C, #F = :F, #N = :N, #V = :V, #A = :A"
                };
                dynamodb.updateItem(param2, function(err, data){
                    if (err) console.log(err);
                    else console.log(data);
            })
            }
            else     console.log(data);           // successful response
        });
    },

    //insert a new User to the DB or if the user is in the DB we update only the Visited list
    insertNewPerson: (param) => {
        param = {
            ExpressionAttributeNames: {
                "#E": "Email",
                "#N": "Name",
                "#V": "Visited"
            },
            ExpressionAttributeValues: {
                ":V": {
                    L: [{
                        SS: [
                            "4",
                            "6.7.2020 15:54:55"
                        ]
                    }
                    ]
                },
                ":N": {
                    S : "Nadav2"
                },
                ":E": {
                    S: "Nadav@walla.com"
                }
            },
            Key: {
                "PhoneNumber": {
                    S: "0544654565"
                }
            },
            ReturnValues: "ALL_NEW",
            TableName: "Users",
            UpdateExpression: "SET #V = list_append(#V, :V), #N = :N, #E = :E"
        };

        dynamodb.updateItem(param, function(err, data) {
            if (err){
                param2 = {
                    ExpressionAttributeNames: {
                        "#E": "Email",
                        "#N": "Name",
                        "#V": "Visited"
                    },
                    ExpressionAttributeValues: {
                        ":V": {
                            L: [{
                                SS: [
                                    "2",
                                    "6.10.2020 15:54:55"
                                ]
                            }
                            ]
                        },
                        ":N": {
                            S : "Nadav2"
                        },
                        ":E": {
                            S: "Nadav@walla.com"
                        }
                    },
                    Key: {
                        "PhoneNumber": {
                            S: "0544654565"
                        }
                    },
                    ReturnValues: "ALL_NEW",
                    TableName: "Users",
                    UpdateExpression: "SET #V = :V, #N = :N, #E = :E"
                };
                dynamodb.updateItem(param2, function(err, data){
                    if (err) console.log(err);
                    else console.log(data);
                })
            }
            else     console.log(data);           // successful response
        });

    },

    //documentation
    updateInfected: (param) => {
        //TODO all the things
    }
};
