const express = require('express');
const ShareRide = require('../models/ShareRide');
const authenticateToken = require('../middleware/user_jwt'); 
const RideParticipation = require('../models/RideParticipation');
const router = express.Router();

// Create a new shared ride with easy validation
router.post('/createRide', authenticateToken, async (req, res) => {
    if (!req.user || !req.user.id) {
    return res.status(400).json({ message: 'Authentication failed. No user ID found.' });
  }

  const { startPoint, endPoint, date, time, seats, price } = req.body;
  const userName = req.user.name;
  
  console.log('Received ride data:', { userName, startPoint, endPoint, date, time, seats, price });

  if ( !startPoint || !endPoint || !date || !time || !seats || !price) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  try {
    const newRide = new ShareRide({
      user: req.user.id, 
      startPoint,
      endPoint,
      date,
      time,
      seats,
      price
    });

    const savedRide = await newRide.save();

    res.status(201).json(savedRide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all shared rides
router.get('/getAllRides', async (req, res) => {
  try {
    const rides = await ShareRide.find({}).populate('user', 'userName');

    if (rides.length === 0) {
      return res.status(404).json({ message: 'No rides found.' });
    }

    res.status(200).json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Ride Search
router.get('/searchRides', async (req, res) => {
  const { startPoint, endPoint, date } = req.query;
  console.log("Search Query:", req.query);

  try {
      const query = {};

      if (startPoint) query.startPoint = new RegExp(startPoint, 'i');
      if (endPoint) query.endPoint = new RegExp(endPoint, 'i');
      if (date) query.date = date; 

      console.log("MongoDB Query:", query);
      const rides = await ShareRide.find(query).populate('user', 'userName');
      console.log("Found Rides:", rides);

      if (rides.length === 0) {
          return res.status(404).json({ message: 'No rides found.' });
      }

      res.json(rides);
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: error.message });
  }
});

// Joining the ride
router.post('/joinRide/:id', authenticateToken, async (req, res) => {
    try {
        const ride = await ShareRide.findById(req.params.id)
        .populate('user', 'userName phoneNumber email');
        const userId = req.user.id;

        if (!ride) {
            return res.status(404).json({ message: "Ride with this rideId does not exist." });
        }

        const alreadyJoined = await RideParticipation.findOne({ userId, rideId: req.params.id });
        if (alreadyJoined) {
            return res.status(400).json({ message: "You have already joined this ride." });
        }

        if (ride.seats > 0) {
            ride.seats -= 1;
            ride.joinedUsers.push(userId);
            await ride.save();

            const participation = new RideParticipation({ userId, rideId: ride._id });
            await participation.save();

            const response = {
              message: "You have successfully joined the ride",
              ride: {
                startPoint: ride.startPoint,
                endPoint: ride.endPoint,
                date: ride.date,
                time: ride.time,
                seats: ride.seats,
                price: ride.price,
                rideId: ride.rideId,
                user: {
                  userName: ride.user.userName,
                  phoneNumber: ride.user.phoneNumber,
                  email: ride.user.email
                }
              }
            };
            res.json(response);
        } else {
            return res.status(400).json({ message: "There are no available seats on this ride." });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Getting user-created rides
router.get('/myCreatedRides', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const rides = await ShareRide.find({ user: userId })
    .populate({
      path: 'joinedUsers',
      select: 'userName email phoneNumber' 
    });

    if (rides.length === 0) {
      return res.status(404).json({ message: 'No rides created by this user.' });
    }

    const transformedRides = rides.map(ride => {
      return {
        _id: ride._id,
        startPoint: ride.startPoint,
        endPoint: ride.endPoint,
        date: ride.date,
        time: ride.time,
        seats: ride.seats,
        price: ride.price,
        joinedUsers: ride.joinedUsers.map(user => ({
          userName: user.userName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        }))
      };
    });
    res.json(transformedRides);
  } catch (error) {
    console.error("Error retrieving created rides for UserID:", userId, "Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Getting the rides the user has joined
router.get('/myJoinedRides', authenticateToken, async (req, res) => {
  let userId;
  try {
      userId = req.user.id;
      console.log("Authenticated UserID:", userId);

      const participations = await RideParticipation.find({ userId })
          .populate({
              path: 'rideId',
              populate: {
                  path: 'user',
                  select: 'userName phoneNumber email'
              }
          });

      if (participations.length === 0) {
          return res.status(404).json({ message: 'This user has not joined any rides.' });
      }

      const rides = participations.map(part => ({
        rideDetails: part.rideId ? {
              _id: part.rideId._id,
              startPoint: part.rideId.startPoint,
              endPoint: part.rideId.endPoint,
              date: part.rideId.date,
              time: part.rideId.time,
              seats: part.rideId.seats,
              price: part.rideId.price,
            } : null,
            createdBy: part.rideId ? part.rideId.user : null,
        }));

      console.log("Transformed rides data:", rides);
      res.json(rides);
    } catch (error) {
      console.error("Error retrieving joined rides for UserID:", userId, "Error:", error);
      res.status(500).json({ message: error.message });
  }
});

// Removing the user from the ride
router.post('/leaveRide/:id', authenticateToken, async (req, res) => {
  try {
      const rideId = req.params.id; 
      const userId = req.user.id;

      const ride = await ShareRide.findById(rideId);
      if (!ride) {
          return res.status(404).json({ message: "Ride with this ID does not exist." });
      }

      const participation = await RideParticipation.findOne({ userId, rideId: rideId }); 
      if (!participation) {
          return res.status(400).json({ message: "You are not signed up for this ride." });
      }

      await RideParticipation.deleteOne({ userId, rideId: rideId }); 

      ride.seats += 1;
      ride.joinedUsers.pull(userId); 
      await ride.save();

      res.json({ message: "You have successfully unsubscribed from the ride." });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// Removing the ride
router.delete('/deleteRide/:id', authenticateToken, async (req, res) => {
  try {
      const rideId = req.params.id;
      const userId = req.user.id;

      const ride = await ShareRide.findById(rideId).exec();

      if (!ride) {
        return res.status(404).json({ message: "Ride with this ID does not exist." });
      }

      if (ride.user.toString() !== userId) {
        return res.status(403).json({ message: "You do not have permission to delete this ride." });
      }

      await ShareRide.findByIdAndDelete(rideId).exec();
      await RideParticipation.deleteMany({ rideId: rideId });

      res.json({ message: "Ride was successfully deleted." });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

module.exports = router;