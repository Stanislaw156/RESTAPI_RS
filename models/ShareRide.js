const mongoose = require('mongoose');

const shareRideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
  },
  joinedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  startPoint: {
    type: String,
    required: true,
  },
  endPoint: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const rideDate = new Date(v);
        return rideDate >= today;
      },
      message: props => `${props.value} is in the past!`
    }
  },
  time: {
    type: String,
    required: true,
  },
  seats: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  }
});
  
const ShareRide = mongoose.model('ShareRide', shareRideSchema);

module.exports = ShareRide;