// const
//     config = require('../../config/env')
//     , Promise = require("bluebird")
//     , request = Promise.promisifyAll(require("request"), {multiArgs: true})
//     , guest = require('../../models/wedding_contact')
//     , AWS = require("aws-sdk")
//     , sg = require('sendgrid')(config.SENDGRID_API_KEY)//todo
// ;
//
// module.exports = function (app) {
// };
//
//
// let sns = new Promise.promisifyAll(new AWS.SNS({
//     accessKeyId: config.accessKeyId,
//     secretAccessKey: config.secretAccessKey,
//     region: config.region
// }));
//
// async function getUsersAndSendSMS() {
//     try {
//         // Send sms to all guests who's number_of_guests = -1 and sms_counter = 0
//         // for the first sending if you want another round of sms then change sms_counter = 1
//         // and it will send to all of those who didn't answered yet
//         let users = await guest.find({$and: [{"number_of_guests": -1}, {sms_counter: 0}]}).lean();
//         let flag_all_good = true;
//         console.log("getUsersAndSendSMS:  " + users.length + " users found");
//         return Promise.map(users, async (user) => {
//             if (flag_all_good) {
//                 try {
//                     await sendSMS(user);
//                     return new Promise((resolve, reject) => {
//                         setTimeout(function () {
//                             console.log("sent sms to: " + user._id);
//                             resolve();
//                         }, 3000);
//                     })
//                 } catch (err) {
//                     flag_all_good = false;
//                     console.error("send sms fail with error: d" + err)
//                 }
//             }
//         }, {concurrency: 1});
//
//     } catch (err) {
//         console.error('error getUsersAndSendSMS: ' + err)
//     }
// }
//
// function sendSMS(user) {
//     return new Promise(function (resolve, reject) {
//
//             console.log("start sending sms to: " + user._id + " Link: " + url);
//             sns.publishAsync({
//                 //todo change your sms content
//                 Message: `Hey, ${user.name}, we will be glad to see you in our wedding,
//                     please RSVP in this link  ${url}
//                     to Israel and Israela Wedding`,
//                 MessageStructure: 'raw',
//                 PhoneNumber: "+" + user.phone
//             })
//                 .then((doc) => {
//                     console.log(`userName: ${user._id}, userPhone: ${user.phone}`);
//                     if (doc.MessageId !== undefined) {
//                         console.log(`MessageId: ${doc.MessageId}`);
//                     }
//                     if (doc.ResponseMetadata !== undefined && doc.ResponseMetadata.RequestId !== undefined) {
//                         console.log(`RequestId: ${doc.ResponseMetadata.RequestId}`)
//                     }
//                     return guest.findOneAndUpdate({
//                             _id: user._id
//                         },
//                         {
//                             $set: {
//                                 sms_counter: user.sms_counter + 1
//                             }
//                         })
//
//                 })
//                 .then((doc) => {
//                     console.log(`sent&save: ${user.name} : ${user.phone}`);
//                     resolve({
//                         name: user.name,
//                         phone: user.phone
//                     });
//                 })
//                 .catch((err) => {
//                     console.log("error happens in send sms " + err);
//                     reject({
//                         name: user.name,
//                         phone: user.phone,
//                         err: err
//                     });
//                     return err;
//                 })
//         }
//     )
// }
// function sendMail(user_name, phone, number) {
//     return new Promise(function (resolve, reject) {
//         const data = {
//             "personalizations": [
//                 {
//                     "to": [
//                         {
//                             "email": config.email,
//                             "name": config.name
//                         }
//                     ],
//                     "subject": "Wedding Invitations List Updated"
//                 }
//             ],
//             "from": {
//                 "email": "admin@wedding.io",
//                 "name": "Wedding Admin"
//             },
//             "content": [
//                 {
//                     "type": "text/html",
//                     "value": `Hey <b>${config.name}</b>,
//
//                                     <p>friend: ${user_name} ,<br>
//                                      phone: ${phone} ,<br>
//                                      brings ${number} ppl to the wedding</p>
//
//                                      <p>Yours,<br>
//                                      The Wedding Admin :)</p>
//         `
//                 }
//             ]
//         };
//
//         let email_request = sg.emptyRequest({
//             method: 'POST',
//             path: '/v3/mail/send',
//             body: data
//         });
//
//         sg.API(email_request, function (error, response) {
//             if (error) {
//                 reject(error);
//             } else {
//                 resolve(response);
//             }
//         })
//
//     });
// }
