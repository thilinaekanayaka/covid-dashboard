const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const caseSchema = require('./caseSchema.js')

//--- Origin whitelisting for the Angular app on port 4200 ---/
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

// async function createCase(name) {
//     return new Cases({
//         name,
//         created: Date.now(),
//         status,
//         location: {
//             district: "colombo",
//             address: "boralesgamuwa"
//         }
//     }).save()
// }

// async function findCase(name = null) {
//     let location = {
//         province: "western",
//         district: "colombo"
//     }
//     // return await Cases.find({ location });
//     return await Cases.find({ 'location.province': 'western' });
// }

async function createCase(newCase) {
    newCase["created"] = Date.now();
    return new Cases(newCase).save();
}

async function findAllCase() {
    return await Cases.find();
}

async function findNumbersByDistrict() {
    return await Cases.aggregate([
        { $facet: {
            cases: [{ $group: { _id: "$location.district", count: { "$sum": 1 } } }]
        }}
    ]);
}

async function findCasesByDistrict(id) {
    return await Cases.find({ 'location.district': id });
}

//--- End of Controller method implementations ---/

//--- API implementations ---/

const connector = mongoose.connect(connectionString, { useUnifiedTopology: true, useNewUrlParser: true });

app.get('/user', async function (req, res) {
    let user = await connector.then(async () => {
        console.log("DB connected");
        return findCase("western");
    });
    res.send(user);
})

app.post('/user', async function (req, res) {
    await connector.then(async () => {
        console.log("DB connected");
        createCase("Weimer Stein");
    });
    res.send("user created");
})

//--- End of API implementations ---/

/////////////////////////////////////////////////////////////////////////////////////////////////

app.post('/create-case', async function (req, res) {
    await connector.then(async () => {
        createCase(req.body);
    });
    res.send("user created");
})

app.get('/all-cases', async function (req, res) {
    let cases = await connector.then(async () => {
        return findAllCase();
    });
    res.send(cases);
})

app.get('/numbers-by-district', async function (req, res) {
    let numbers = await connector.then(async () => {
        return findNumbersByDistrict();
    });
    res.send(numbers[0]);
})

app.get('/cases-by-district', async function (req, res) {
    console.log("Req body : " + JSON.stringify(req.query));
    let cases = await connector.then(async () => {
        return findCasesByDistrict(req.query["_id"]);
    });
    res.send(cases);
})