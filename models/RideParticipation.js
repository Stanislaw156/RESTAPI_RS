const mongoose = require('mongoose');

const rideParticipationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'ShareRide', required: true },
});

const RideParticipation = mongoose.model('RideParticipation', rideParticipationSchema);

module.exports = RideParticipation;