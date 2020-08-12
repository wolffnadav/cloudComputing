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

//editable parameter - the average time user stays in a business
let avgDuration = 30;

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
            "#A": "Address",
            "#VL": "VisitorsList"
        },
        ExpressionAttributeValues: {
            ":F": {N: "0"},
            ":N": {S: req.body.businessname},
            ":V": {N: "0"},
            ":A": {S: req.body.address},
            ":VL": {L: [{SS: ["dummy", "dummy2"]}]}
        },
        Key: {"ID": {S: newID.toString()}},
        ReturnValues: "ALL_NEW",
        TableName: "Businesses",
        UpdateExpression: "SET #F = :F, #N = :N, #V = :V, #A = :A, #VL = :VL"
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
        dynamodb.getItem(param, function (err, data) {
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
                        // ":N": {S: req.body.businessname},
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


//user noticed that he got infected - this will send an alert to all users who are in risk
//TODO
app.post('/api/sendInfectedAlert', function (req, res) {
    // enter the infected user to the infected table to trigger the lambada function that sends all the users in danger SMS
    //convert milliseconds to date
    let date = new Date(parseInt(req.body.dateOfNotice)).getTime().toString();
    let phoneNumber = req.body.phoneNumber;

    //entered the notice to the infected table
    let updateInfectedTable = {
        ExpressionAttributeNames: { "#D": "Date"},
        ExpressionAttributeValues: { ":D": {S: date} },
        Key: {"PhoneNumber": {S: phoneNumber}},
        TableName: "Infected",
        UpdateExpression: "SET #D = :D"
    };

    db.updateInfected(updateInfectedTable);

    //find in which restaurants our user was during his infectious time
    let getBusiness = new Promise((resolve, reject) => {
        let getBusinessParam = {
            TableName: "Users",
            Key: {"PhoneNumber": {"S": phoneNumber}},
            ProjectionExpression: 'Visited'
        }
        //get all the business that infected visited from users table
        dynamodb.getItem(getBusinessParam, function(err, data){
            if(err){
                reject(console.log("error in getting infected businesses"));
            } else {
                resolve(data.Item.Visited.L);
            }
        });
    }).then((resolve) => {
        //filter the data to only relevant business
        return resolve.map((element) => {
            let businessID = element.SS[0];
            let timeStamp = element.SS[1];
            if (element.SS[0][element.SS[0].length - 1] === ')') {
                businessID = element.SS[1];
                timeStamp = element.SS[0];
            }

            // convert timeStamp to milliTime and calculate exit time - make use of global variable avgDuration
            let infectedEntranceTime = Date.parse(timeStamp);
            let infectedExitTime = infectedEntranceTime + (avgDuration * 1000 * 60);


        });

    });

    // getBusiness.then(resolve => {
    //     //init list of all the people who should be warned
    //     let warningList = [];
    //
    //     //now resolve is an array of all of the users data got from the query above
    //     resolve.forEach(async (element) => {
    //         try {
    //             //find out businessID and timeStamp
    //             let businessID = element.SS[0];
    //             let timeStamp = element.SS[1];
    //             if (element.SS[0][element.SS[0].length - 1] === ')') {
    //                 businessID = element.SS[1];
    //                 timeStamp = element.SS[0];
    //             }
    //
    //             //convert timeStamp to milliTime and calculate exit time - make use of global variable avgDuration
    //             let infectedEntranceTime = Date.parse(timeStamp);
    //             let infectedExitTime = infectedEntranceTime + (avgDuration * 1000 * 60);
    //
    //             // --  get phone number that need to be warned  --  //
    //
    //             // query the Business table for all the visitors that came to this business - this code is synchronized
    //             let getBusinessVisitors = await queryBusinessTableForVisitors(businessID);
    //
    //             let flag = true;                    //flag to skip the dummy first entry in business Visited list
    //             let i = getBusinessVisitors.length;
    //             let counter = 0;
    //             getBusinessVisitors.forEach(element => {
    //                 counter++;
    //                 if (flag) {
    //                     //dummy skip this
    //                     flag = false;
    //                 } else {
    //                     //else get the users phone number and time of entrance
    //                     let userPhoneNumber = element.SS[0];
    //                     let userEntrance = element.SS[1];
    //                     if (userEntrance[userEntrance.length - 1] !== ')') {
    //                         userPhoneNumber = element.SS[1];
    //                         userEntrance = element.SS[0];
    //                     }
    //
    //                     // console.log("userPhoneNumber");
    //                     // console.log(userPhoneNumber);
    //                     // console.log("userEntrance");
    //                     // console.log(userEntrance);
    //
    //                     //convert time of entrance to milliseconds
    //                     let userMilliTimeEntrance = Date.parse(userEntrance);
    //
    //                     //if the user was at the business when the infected person was add his phone number to warning list
    //                     if (infectedEntranceTime <= userMilliTimeEntrance && infectedExitTime >= userMilliTimeEntrance) {
    //                         warningList.push(userPhoneNumber);
    //                     }
    //                 }
    //
    //             });
    //
    //             if(counter === 1) console.log("warning List before removing duplicates");
    //             if(counter === 1) console.log(warningList);
    //             if(counter === 1) return warningList;
    //
    //         } catch (err){
    //             console.log("error caught in catch after await" + err);
    //         }
    //
    //     });
    //
    // }).then(resolve => {
    //     console.log("entered 2");
    //     console.log(resolve);
    //     //remove duplicates from resolve list
    //     let uniqueSet = new Set(resolve);
    //     console.log(uniqueSet);
    //     //remove the infected person from the set
    //     uniqueSet.delete(phoneNumber)
    //
    //     uniqueSet.forEach(element => {
    //         console.log(element);
    //     })
    //     //send SMS to all the phones in resolve list
    //
    //
    // }).catch(reject => {
    //     console.log(reject);
    // })


    //send a text message to all users that were in the same places our infectious user was
    //TODO

    //send response back to front end
    res.send({
        "statusCode": "200"
    });
});


//Get all Businesses Names for the drop down list in the register-person page
app.get('/api/getBusinessesNames', function (req, res) {
    //step 1 - get Business name and ID by a promise
    const getBusinessData = new Promise((resolve, reject) => {
        dynamodb.scan({TableName: "BusinessNameToID"}).eachPage((err, data) => {
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


//this function gets BusinessID and timeStamp and returns the warning phone numbers from this specific business
function getPhoneNumbersToWarn(businessID, timeStamp){
    let infectedEntranceTime = timeStamp;
    let infectedExitTime = timeStamp + (avgDuration * 1000 * 60)

    //query the DB for all the visitors in this business
    let getBusinessVisitorsParam = {
        TableName: "Businesses",
        Key: {"ID": {"S": businessID}},
        ProjectionExpression: 'VisitorsList'
    }

    let getBusinessVisitors = new Promise((resolve, reject) => {
        dynamodb.getItem(getBusinessVisitorsParam, function(err, data){
            if(err){
                reject("error in getPhoneNumbersToWarn " + err);
            } else {
                resolve(data.Item.VisitorsList.L);
            }
        });
    });

    getBusinessVisitors.then(resolve => {
        let warningPhoneNumbers = [];
        //remember first item is a dummy
        let flag = true;
        resolve.forEach(element => {
            if(flag){
                //dummy skip this
                flag = false;
            } else {
                let userPhoneNumber = element.SS[0];
                let userEntrance = element.SS[1];
                if(userEntrance[userEntrance.length - 1] !== ')'){
                    userPhoneNumber = element.SS[1];
                    userEntrance = element.SS[0];
                }

                let userMilliTimeEntrance = Date.parse(userEntrance);

                //if the user was at the business when the infected person was add his phone number to warning list
                if(infectedEntranceTime <= userMilliTimeEntrance && infectedExitTime >= userMilliTimeEntrance){
                    warningPhoneNumbers.push(userPhoneNumber);
                }
            }
        })

        return warningPhoneNumbers;

    }).catch(reject => {
        console.log("error in getPhoneNumbersToWarn promise " + reject)
        return null;
    })
}

function queryBusinessTableForVisitors(businessID){
    //query the DB for all the visitors in this business
    let getBusinessVisitorsParam = {
        TableName: "Businesses",
        Key: {"ID": {"S": businessID}},
        ProjectionExpression: 'VisitorsList'
    }

    return new Promise((resolve, reject) => {
        dynamodb.getItem(getBusinessVisitorsParam, function(err, data){
            if(err){
                reject("error in getPhoneNumbersToWarn " + err);
            } else {
                resolve(data.Item.VisitorsList.L);
            }
        });
    });
}
