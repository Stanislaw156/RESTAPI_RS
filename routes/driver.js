const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const User = require('../models/User');
const user_jwt = require('../middleware/user_jwt');
const mongoose = require('mongoose');
const UserRole = require('../models/UserRole');

// Adding a new driver
router.post('/createDriver', user_jwt, async (req, res) => {
    const {
        firstName,
        lastName,
        birthDate,
        vehicle,
        registrationNumber,
        note
    } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const userRole = await UserRole.findOne({ user: userId });
        if (!userRole || !userRole.isDriver) {
            return res.status(403).json({ msg: 'User is not authorized as a driver' });
        }

    const driverId = userRole.driverId || new mongoose.Types.ObjectId();
    
    try {
        const driver = new Driver({
            _id: driverId,
            userId,
            firstName,
            lastName,
            birthDate,
            vehicle,
            registrationNumber,
            note
    });

        await driver.save();

        if (!userRole.driverId) {
            userRole.driverId = driverId;
            await userRole.save();
        }

        res.status(201).json({ success: true, driver });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Getting information about drivers
router.get('/getInfoDriver', user_jwt, async (req, res) => {
    try {
        const drivers = await Driver.find().populate('userId', '-password');
        res.json(drivers);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Get a specific driver by the driverId assigned to the user
router.get('/myDriverInfo', user_jwt, async (req, res) => {
    const userId = req.user.id;

    try {
        const userRole = await UserRole.findOne({ user: userId });
        if (!userRole || !userRole.driverId) {
            return res.status(404).json({ msg: 'Driver profile not found for this user' });
        }

        const driver = await Driver.findById(userRole.driverId).populate('userId', '-password');
        if (!driver) {
            return res.status(404).json({ msg: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// Update driver information according to the driverId assigned to the user
router.put('/updateMyDriverInfo', user_jwt, async (req, res) => {
    const { firstName, lastName, birthDate, vehicle, registrationNumber, note } = req.body;
    const userId = req.user.id;

    try {
        const userRole = await UserRole.findOne({ user: userId });
        if (!userRole || !userRole.driverId) {
            return res.status(404).json({ msg: 'Driver profile not found for this user' });
        }

        const driverUpdate = await Driver.findByIdAndUpdate(
            userRole.driverId,
            { $set: { firstName, lastName, birthDate, vehicle, registrationNumber, note } },
            { new: true }
        );

        if (!driverUpdate) {
            return res.status(404).json({ msg: 'Driver not found' });
        }
        res.json(driverUpdate);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;