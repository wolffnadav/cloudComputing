const express = require('express');
const app = express();
const port = 3000;
bodyParser = require('body-parser');
const db = require('./dbMethods');
const config = require('./config/config');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/api/ping', function (req, res) {
    console.log('Ping from Angular works!');
    res.send({
        "statusCode": "200",
        "body": "Ping"
    });

});

app.post('/api/insertNewBusiness', function (req, res) {
    console.log('insertNewBusiness from Angular works!');
    console.log(req.body.key);
    db.insertNewBusiness(req.body.key);
    res.send({
        "statusCode": "200"
    });
});

app.listen(port, () => console.log(`app listening at http://localhost:${port}`));


