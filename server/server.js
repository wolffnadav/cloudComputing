const express = require('express');
const app = express();
const port = 3000;
bodyParser = require('body-parser');
aws = require('aws-sdk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/api/get-images', (req, res) => {
            console.log('Get images done successfully! ');
            res.send(
                {
                    "statusCode": "200",
                    "images": imagesUrlArray
                })// successful response

});


app.listen(port, () => console.log(`app listening at http://localhost:${port}`));


