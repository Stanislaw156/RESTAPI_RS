const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthDate: {
        type: String,
        required: true
    },
    vehicle: {
        type: String,
        required: true
    },
    registrationNumber: {
        type: String,
        required: true
    },
    note: {
        type: String
    }
});

module.exports = mongoose.model('Driver', driverSchema);