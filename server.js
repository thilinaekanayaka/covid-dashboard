const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userSchema = require('./userSchema.js')

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

const connectionString = 'mongodb+srv://root:1234@cluster0-9qy9w.mongodb.net/test?retryWrites=true&w=majority';

const User = mongoose.model('user', userSchema, 'user');

async function createUser(username) {
    return new User({
        username,
        created: Date.now()
    }).save()
}

async function findUser(username) {
    return await User.findOne({ username });
}

const connector = mongoose.connect(connectionString, { useUnifiedTopology: true, useNewUrlParser: true });

app.get('/user', async function (req, res) {
    let user = await connector.then(async () => {
        console.log("DB connected");
        return findUser("test user");
    });
    res.send(user);
})

app.post('/user', async function (req, res) {
    await connector.then(async () => {
        console.log("DB connected");
        createUser("new user");
    });
    res.send("user created");
})