const mongoose = require('mongoose');

const userRoleSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDriver: { 
        type: Boolean, 
        required: true 
    },
    isPassenger: { 
        type: Boolean, 
        required: true 
    },
    driverId: { 
        type: String, 
        default: null 
    },
    passengerId: { 
        type: String, 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('UserRole', userRoleSchema);