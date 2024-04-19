const express = require('express');
const router = express.Router();
const Passenger = require('../models/Passenger');
const User = require('../models/User');
const user_jwt = require('../middleware/user_jwt');
const mongoose = require('mongoose');
const UserRole = require('../models/UserRole');

// Adding a new passenger
router.post('/createPassenger', user_jwt, async (req, res) => {
    const {
        firstName,
        lastName,
        birthDate,
        note
    } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const userRole = await UserRole.findOne({ user: userId });
        if (!userRole || !userRole.isPassenger) {
            return res.status(403).json({ msg: 'User is not authorized as a passenger' });
        }

    const passengerId = userRole.passengerId || new mongoose.Types.ObjectId();

    try {
        const passenger = new Passenger({
            _id: passengerId,
            userId,
            firstName,
            lastName,
            birthDate,
            note
        });

        await passenger.save();

        if (!userRole.passengerId) {
            userRole.passengerId = passengerId;
            await userRole.save();
        }

        res.status(201).json({ success: true, passenger });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Getting information about passenger
router.get('/getInfoPassenger', user_jwt, async (req, res) => {
    try {
        const passengers = await Passenger.find().populate('userId', '-password');
        res.json(passengers);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Get a specific passenger by the passengerId assigned to the user
router.get('/myPassengerInfo', user_jwt, async (req, res) => {
    const userId = req.user.id;

    try {
        const userRole = await UserRole.findOne({ user: userId });
        if (!userRole || !userRole.passengerId) {
            return res.status(404).json({ msg: 'Passenger profile not found for this user' });
        }

        const passenger = await Passenger.findById(userRole.passengerId).populate('userId', '-password');
        if (!passenger) {
            return res.status(404).json({ msg: 'Passenger not found' });
        }
        res.json(passenger);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Update passenger information according to the passengerId assigned to the user
router.put('/updateMyPassengerInfo', user_jwt, async (req, res) => {
    const { firstName, lastName, birthDate, note } = req.body;
    const userId = req.user.id;

    try {
        const userRole = await UserRole.findOne({ user: userId });
        if (!userRole || !userRole.passengerId) {
            return res.status(404).json({ msg: 'Passenger profile not found for this user' });
        }

        const passengerUpdate = await Passenger.findByIdAndUpdate(
            userRole.passengerId,
            { $set: { firstName, lastName, birthDate, note } },
            { new: true }
        );

        if (!passengerUpdate) {
            return res.status(404).json({ msg: 'Passenger not found' });
        }
        res.json(passengerUpdate);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;