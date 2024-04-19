const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const user_jwt = require('../middleware/user_jwt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Getting information about the current user
router.get('/', user_jwt, async(req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
            res.status(200).json({
                success: true,
                user: user
            });
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        })
        next();
    }
});

// User registration
router.post('/register', async (req, res) => {
    const { userName, email, password, phoneNumber } = req.body;

    try {
        
        let user_exist = await User.findOne({ email: email });

        if(user_exist) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const user = new User({
            userName,
            email,
            password,
            phoneNumber
        });
        
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);

        const payload = {
            user: {
                id: user._id,
                name: user.userName
            }
        };
        const token = jwt.sign(payload, process.env.jwtUserSecret, { expiresIn: '100y' });
       
        user.token = token; 
        await user.save();

        res.status(201).json({
            success: true,
            msg: 'User registered successfully',
            token: token,
            userId: user._id
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// User login
router.post('/login', async(req, res) => {
    const { email, password } = req.body;

    try {

        let user = await User.findOne({ email: email });

        if(!user) {
            return res.status(400).json({ msg: 'User not exists go & register to continue.' });
        }

        const isMatch = await bcryptjs.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ msg: 'Invalid Password' });
        }

        if (!user.token) {
            user.token = jwt.sign({ id: user._id }, process.env.jwtUserSecret, { expiresIn: '100y' });
            await user.save();
        }

        res.json({
            success: true, 
            token: user.token, 
            userId: user._id
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router; 