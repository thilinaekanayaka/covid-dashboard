const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')

var originsWhitelist = [
    'http://localhost:4200'
];

var corsOptions = {
    origin: function (origin, callback) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
}

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.listen(3000, function () {
    console.log('listening on 3000')
})

app.get('/', function (req, res) {
    console.log("Req body : " + JSON.stringify(req.query));
    res.json({ message: 'success' })
})

app.post('/', function (req, res) {
    console.log("Req body : " + JSON.stringify(req.body));
    res.json({ message: 'success' })
})