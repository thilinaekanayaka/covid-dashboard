const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const caseSchema = require('./caseSchema.js')

//--- Origin whitelisting for the Angular app running on port 4200 ---/

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

//--- End of Origin whitelisting for the Angular app on port 4200 ---/

//Encoding settings for JSON responses
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//--- Testing and app init ---/

app.listen(3000, function () {
    console.log('listening on 3000');
})

app.get('/', function (req, res) {
    console.log("Req body : " + JSON.stringify(req.query));
    res.json({ message: 'success' });
})

app.post('/', function (req, res) {
    console.log("Req body : " + JSON.stringify(req.body));
    res.json({ message: 'success' });
})

//--- End of Testing and app init ---/

//--- Controller methods implementations ---/

const connectionString = 'mongodb+srv://root:1234@cluster0-9qy9w.mongodb.net/dashboard?retryWrites=true&w=majority';
const Cases = mongoose.model('cases', caseSchema, 'cases');
const connector = mongoose.connect(connectionString, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });

const AUTH_TOKEN = "heXdXxRU33TrW24S";

function authenticate(auth_token) {
    if (auth_token == AUTH_TOKEN) return true;
    else return false;
}

async function createCase(newCase, res) {
    newCase["created"] = Date.now();
    return new Cases(newCase).save(function (err) {
        if (err) {
            res.status(400);
            res.send({
                "message": "There was an error",
                "errors": err["errors"]
            });
        } else {
            res.status(201);
            res.send({ "message": "Case created" });
        }
    });
}

async function editCase(caseData, res) {
    const casaeID = caseData["_id"];
    delete caseData["_id"];
    return await Cases.findByIdAndUpdate({ '_id': casaeID }, caseData, function (err) {
        if (err) {
            res.status(400);
            res.send({
                "message": "There was an error",
                "errors": err["errors"]
            });
        } else {
            res.status(200);
            res.send({ "message": "Case edited" });
        }
    });
}

async function removeCase(id) {
    return await Cases.findOneAndDelete({ '_id': id });
}

async function findAllCases() {
    return await Cases.find();
}

async function findNumbersByDistrict() {
    return await Cases.aggregate([
        {
            $facet: {
                cases: [{ $group: { _id: "$location.district", count: { "$sum": 1 } } }]
            }
        }
    ]);
}

async function findCasesByDistrict(id) {
    return await Cases.find({ 'location.district': id });
}

async function findCaseByID(id) {
    return await Cases.find({ '_id': id });
}

//--- End of Controller method implementations ---/

//--- API implementations ---/

app.post('/create-case', async function (req, res) {
    if (authenticate(req.headers["auth_token"])) {
        await connector.then(async () => {
            createCase(req.body, res);
        });
    } else {
        res.status(403);
        res.send({ "message": "Invalid Auth Token" });
    }
})

app.post('/edit-case', async function (req, res) {
    if (authenticate(req.headers["auth_token"])) {
        await connector.then(async () => {
            editCase(req.body, res);
        });
    } else {
        res.status(403);
        res.send({ "message": "Invalid Auth Token" });
    }
})

app.get('/remove-case', async function (req, res) {
    if (authenticate(req.headers["auth_token"])) {
        if (req.query["_id"]) {
            await connector.then(async () => {
                return removeCase(req.query["_id"]);
            });
            res.status(200);
            res.send({ "message": "Case removed" });
        } else {
            res.status(400);
            res.send({ "message": "Case ID is required" });
        }
    } else {
        res.status(403);
        res.send({ "message": "Invalid Auth Token" });
    }
})

app.get('/all-cases', async function (req, res) {
    if (authenticate(req.headers["auth_token"])) {
        res.status(200);
        res.send(await connector.then(async () => {
            return findAllCases();
        }));
    } else {
        res.status(403);
        res.send({ "message": "Invalid Auth Token" });
    }
})

app.get('/numbers-by-district', async function (req, res) {
    if (authenticate(req.headers["auth_token"])) {
        let numbers = await connector.then(async () => {
            return findNumbersByDistrict();
        });
        res.status(200);
        res.send(numbers[0]);
    } else {
        res.status(403);
        res.send({ "message": "Invalid Auth Token" });
    }
})

app.get('/cases-by-district', async function (req, res) {
    if (authenticate(req.headers["auth_token"])) {
        if (req.query["_id"]) {
            res.status(200);
            res.send(await connector.then(async () => {
                return findCasesByDistrict(req.query["_id"]);
            }));
        } else {
            res.status(400);
            res.send({ "message": "District ID is required" });
        }
    } else {
        res.status(403);
        res.send({ "message": "Invalid Auth Token" });
    }
})

app.get('/case-by-id', async function (req, res) {
    if (authenticate(req.headers["auth_token"])) {
        if (req.query["_id"]) {
            let singleCase = await connector.then(async () => {
                return findCaseByID(req.query["_id"]);
            });
            res.status(200);
            res.send(singleCase[0]);
        } else {
            res.status(400);
            res.send({ "message": "Case ID is required" });
        }
    } else {
        res.status(403);
        res.send({ "message": "Invalid Auth Token" });
    }
})

//--- End of API implementations ---/