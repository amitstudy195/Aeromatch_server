const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  variant: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  safetyRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  specs: {
    trunkSpace: {
      type: Number,
      required: true,
      min: 0
    },
    seating: {
      type: Number,
      required: true,
      min: 1
    },
    drivetrain: {
      type: String,
      required: true,
      enum: ['FWD', 'RWD', 'AWD', '4WD']
    }
  },
  userReviews: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Car', carSchema);
