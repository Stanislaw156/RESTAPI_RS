const express = require('express');
const router = express.Router();
const User = require('../models/User');
const UserRole = require('../models/UserRole');
const mongoose = require('mongoose');
const user_jwt = require('../middleware/user_jwt');

// Assigning role and ID to user
router.post('/assignRole', user_jwt, async (req, res) => {
    const { isDriver, isPassenger } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        let userRole = await UserRole.findOne({ user: userId });
        if (!userRole) {
            userRole = new UserRole({ user: userId });
        }

        if (isDriver) {
            userRole.isDriver = true;
            userRole.isPassenger = false;
            userRole.driverId = new mongoose.Types.ObjectId().toString(); 
            userRole.passengerId = null;
        } else if (isPassenger) {
            userRole.isDriver = false;
            userRole.isPassenger = true;
            userRole.passengerId = new mongoose.Types.ObjectId().toString(); 
            userRole.driverId = null;
        }

        await userRole.save();

        res.json({
            msg: 'Role assigned successfully',
            role: {
                isDriver: userRole.isDriver,
                isPassenger: userRole.isPassenger,
                driverId: userRole.driverId,
                passengerId: userRole.passengerId
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Detecting the role of the user (driver or passenger)
router.get('/getRole', user_jwt, async (req, res) => {
    const userId = req.user.id; 

    try {
        const userRole = await UserRole.findOne({ user: userId });
        if (!userRole) {
            return res.status(404).json({ msg: 'User role not found' });
        }

        if (userRole.isDriver) {
            res.json({ role: 'Driver', driverId: userRole.driverId });
        } else if (userRole.isPassenger) {
            res.json({ role: 'Passenger', passengerId: userRole.passengerId });
        } else {
            res.status(404).json({ msg: 'User has no assigned role' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;