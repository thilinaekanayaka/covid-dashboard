const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Username is required']
    },
    age: {
        type: Number,
        required: [true, 'Age is required']
    },
    gender: {
        type: Number,
        required: [true, 'Gender is required']
    },
    created: {
        type: Date,
        required: [true, 'Created date is required']
    },
    status: {
        type: Number,
        required: [true, 'Status date is required']
    },
    location: {
        district: {
            type: Number,
            required: [true, 'District is required']
        },
        address: {
            type: String,
            required: [true, 'Address is required']
        }
    }
})

module.exports = caseSchema;