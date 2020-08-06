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

db.insertNewPerson(null);

app.listen(port, () => console.log(`app listening at http://localhost:${port}`));


