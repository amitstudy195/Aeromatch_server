const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Car = require('./models/Car');

const cars = [
  {
    make: "Toyota",
    model: "RAV4",
    variant: "XLE",
    price: 31000,
    mileage: 30,
    safetyRating: 5,
    specs: {
      trunkSpace: 37.6,
      seating: 5,
      drivetrain: "AWD"
    },
    userReviews: [
      "Super spacious trunk and extremely reliable family car.",
      "Great fuel economy for an AWD SUV.",
      "Safety feels top-notch, highly recommend for road trips.",
      "The cabin noise is a bit high on the highway, but overall solid value."
    ]
  },
  {
    make: "Honda",
    model: "Civic",
    variant: "LX",
    price: 25000,
    mileage: 36,
    safetyRating: 5,
    specs: {
      trunkSpace: 14.8,
      seating: 5,
      drivetrain: "FWD"
    },
    userReviews: [
      "Outstanding fuel economy and very easy to park in city commute.",
      "Feels very safe and nimble around tight corners.",
      "Trunk space is a bit small, cramped for a family road trip.",
      "Incredibly cheap to run, basic maintenance has been zero."
    ]
  },
  {
    make: "Ford",
    model: "Explorer",
    variant: "Limited",
    price: 46000,
    mileage: 24,
    safetyRating: 5,
    specs: {
      trunkSpace: 47.9,
      seating: 7,
      drivetrain: "AWD"
    },
    userReviews: [
      "Amazing family hauler, third row is perfect for kids.",
      "Tons of trunk space for camping gear.",
      "Thirsty engine, a bit of a gas guzzler on road trips.",
      "Expensive to maintain and pricey insurance, but very safe."
    ]
  },
  {
    make: "Jeep",
    model: "Wrangler",
    variant: "Sport",
    price: 34000,
    mileage: 19,
    safetyRating: 3,
    specs: {
      trunkSpace: 31.7,
      seating: 4,
      drivetrain: "4WD"
    },
    userReviews: [
      "Insane off-road capability, perfect weekend adventure car!",
      "Very poor mileage, it is a thirsty gas guzzler.",
      "Unsafe at highway speeds, cabin feels shaky and unstable.",
      "Cramped backseat and expensive to maintain."
    ]
  },
  {
    make: "Tesla",
    model: "Model 3",
    variant: "Standard Range",
    price: 39000,
    mileage: 130,
    safetyRating: 5,
    specs: {
      trunkSpace: 23.0,
      seating: 5,
      drivetrain: "RWD"
    },
    userReviews: [
      "Zero gas cost! Incredible fuel efficiency.",
      "Super safe autopilot features, highly advanced.",
      "Trunk is decent but opening is narrow.",
      "Expensive to repair if you get into an accident."
    ]
  },
  {
    make: "Chevrolet",
    model: "Spark",
    variant: "1LT",
    price: 15000,
    mileage: 33,
    safetyRating: 2,
    specs: {
      trunkSpace: 11.1,
      seating: 4,
      drivetrain: "FWD"
    },
    userReviews: [
      "Extremely low cost and cheap to buy.",
      "Fits in any parking spot, perfect city commute.",
      "Flimsy build quality, unsafe highway crash test results.",
      "Very cramped interior, no room for luggage or strollers."
    ]
  },
  {
    make: "Subaru",
    model: "Outback",
    variant: "Premium",
    price: 32000,
    mileage: 28,
    safetyRating: 5,
    specs: {
      trunkSpace: 32.5,
      seating: 5,
      drivetrain: "AWD"
    },
    userReviews: [
      "Best weekend adventure vehicle, handles mud and snow easily.",
      "Extremely safe with EyeSight driver assist.",
      "Excellent cargo space for dogs and gear.",
      "Slightly sluggish engine performance but great ride comfort."
    ]
  },
  {
    make: "Toyota",
    model: "Prius",
    variant: "LE",
    price: 29000,
    mileage: 56,
    safetyRating: 5,
    specs: {
      trunkSpace: 27.4,
      seating: 5,
      drivetrain: "FWD"
    },
    userReviews: [
      "Unbelievable mileage, rarely visit the gas station.",
      "Great city commute commuter vehicle.",
      "Safe and reliable, but styling is not for everyone.",
      "Trunk is surprisingly useful due to hatchback shape."
    ]
  },
  {
    make: "Kia",
    model: "Telluride",
    variant: "EX",
    price: 44000,
    mileage: 23,
    safetyRating: 5,
    specs: {
      trunkSpace: 87.0,
      seating: 8,
      drivetrain: "AWD"
    },
    userReviews: [
      "The ultimate family hauler, massive seating capacity.",
      "Very high-end interior, feels like a luxury car.",
      "Tons of trunk space even with all seats up.",
      "Rather low fuel efficiency, high fuel cost."
    ]
  },
  {
    make: "Hyundai",
    model: "Accent",
    variant: "SE",
    price: 17500,
    mileage: 36,
    safetyRating: 4,
    specs: {
      trunkSpace: 13.7,
      seating: 5,
      drivetrain: "FWD"
    },
    userReviews: [
      "Excellent budget car, very cheap to run.",
      "Great city commuter, low maintenance costs.",
      "Safety is decent, but lacks advanced crash avoidance systems.",
      "Interior is plain and plasticky, limited trunk space."
    ]
  },
  {
    make: "Mazda",
    model: "CX-5",
    variant: "Touring",
    price: 30000,
    mileage: 26,
    safetyRating: 5,
    specs: {
      trunkSpace: 30.8,
      seating: 5,
      drivetrain: "AWD"
    },
    userReviews: [
      "Premium interior design, fun driving dynamics.",
      "Excellent safety features, highly responsive.",
      "Trunk space is average but fits standard luggage.",
      "Fuel economy is just okay, nothing special."
    ]
  },
  {
    make: "Dodge",
    model: "Durango",
    variant: "SXT",
    price: 41000,
    mileage: 21,
    safetyRating: 4,
    specs: {
      trunkSpace: 43.3,
      seating: 7,
      drivetrain: "AWD"
    },
    userReviews: [
      "Strong towing capacity, powerful engine.",
      "Spacious seating for a large family.",
      "A total gas guzzler, very poor fuel efficiency.",
      "Frequent minor electronic issues, expensive to maintain."
    ]
  },
  {
    make: "Nissan",
    model: "Versa",
    variant: "S",
    price: 16500,
    mileage: 35,
    safetyRating: 3,
    specs: {
      trunkSpace: 14.7,
      seating: 5,
      drivetrain: "FWD"
    },
    userReviews: [
      "Super low cost, highly affordable new car option.",
      "Great mileage for daily driving.",
      "Cheap materials, feel unsafe when passing large semi-trucks.",
      "Trunk space is surprisingly deep but cabin is cramped."
    ]
  },
  {
    make: "Porsche",
    model: "Macan",
    variant: "Base",
    price: 62000,
    mileage: 21,
    safetyRating: 5,
    specs: {
      trunkSpace: 17.2,
      seating: 5,
      drivetrain: "AWD"
    },
    userReviews: [
      "Incredible handling and performance, absolute blast to drive.",
      "Beautiful design, feels extremely premium.",
      "Overpriced parts, very expensive to maintain.",
      "Very small trunk space for a crossover SUV."
    ]
  },
  {
    make: "Ford",
    model: "Bronco Sport",
    variant: "Big Bend",
    price: 31500,
    mileage: 26,
    safetyRating: 5,
    specs: {
      trunkSpace: 32.5,
      seating: 5,
      drivetrain: "4WD"
    },
    userReviews: [
      "Rugged style, great for weekend adventure trips.",
      "Handles rough terrain very well with AWD.",
      "Trunk space is tall and easy to load.",
      "A bit noisy on highway drives, mileage is mediocre."
    ]
  },
  {
    make: "BMW",
    model: "X5",
    variant: "sDrive40i",
    price: 65000,
    mileage: 23,
    safetyRating: 5,
    specs: {
      trunkSpace: 33.9,
      seating: 5,
      drivetrain: "RWD"
    },
    userReviews: [
      "Incredibly smooth ride and powerful engine.",
      "Very safe handling and premium cabin feels worth the price.",
      "Expensive options and high maintenance costs.",
      "Great cargo room but third row is too tight."
    ]
  },
  {
    make: "Audi",
    model: "Q7",
    variant: "Premium Plus",
    price: 59000,
    mileage: 21,
    safetyRating: 5,
    specs: {
      trunkSpace: 14.2,
      seating: 7,
      drivetrain: "AWD"
    },
    userReviews: [
      "Outstanding safety ratings, absolute peace of mind for the family.",
      "Luxury ride quality and premium styling are top-notch.",
      "Thirsty engine, quite heavy on fuel.",
      "Third row is a bit cramped for adults."
    ]
  },
  {
    make: "Lexus",
    model: "RX",
    variant: "350 Premium",
    price: 52000,
    mileage: 25,
    safetyRating: 5,
    specs: {
      trunkSpace: 29.6,
      seating: 5,
      drivetrain: "AWD"
    },
    userReviews: [
      "Incredibly reliable, quiet and comfortable luxury cruiser.",
      "Excellent standard safety features and smooth ride.",
      "Cargo space is slightly compromised by the sloping roofline.",
      "Sluggish engine compared to German sportier options."
    ]
  },
  {
    make: "Volvo",
    model: "XC90",
    variant: "Core",
    price: 56000,
    mileage: 24,
    safetyRating: 5,
    specs: {
      trunkSpace: 15.8,
      seating: 7,
      drivetrain: "AWD"
    },
    userReviews: [
      "Pristine safety credentials, Volvo always leads in passenger safety.",
      "Superb family hauler, spacious and extremely comfortable.",
      "Infotainment system can be sluggish and confusing.",
      "Repair costs are high for minor parts."
    ]
  }
];

const seedDB = async () => {
  await connectDB();
  try {
    await Car.deleteMany({});
    console.log('Cleared existing car data.');

    await Car.insertMany(cars);
    console.log('Seeded cars successfully.');

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Seeding failed:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
