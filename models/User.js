const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    isDriver: { 
        type: Boolean, 
        default: false 
    },
    isPassenger: { 
        type: Boolean, 
        default: false 
    },
    driverId: { 
        type: String, 
        default: null 
    },
    passengerId: { 
        type: String, 
        default: null 
    },
    token: { type: String }
});

module.exports = mongoose.model('User', userSchema);