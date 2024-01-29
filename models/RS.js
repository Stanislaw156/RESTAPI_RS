const mongoose = require('mongoose');

const RSSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description:{
        type: String
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    finished:{
        type: Boolean,
        default: false
    },
    cretedAt:{
        type: Date,
        default: Date.now
    }


});

module.exports = RS = mongoose.model('RS', RSSchema);