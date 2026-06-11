const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const recommendationsRoute = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/recommendations', recommendationsRoute);

// Serve Static Assets in Production (React Build) if present
const fs = require('fs');
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Safe fallback if client is hosted separately (e.g. Vercel, Netlify)
  app.get('/', (req, res) => {
    res.json({ 
      status: "success", 
      message: "AeroMatch Contextual Matching API is running successfully!" 
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
