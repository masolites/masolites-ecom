
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Web3 = require('web3');
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Initialize Web3
const web3 = new Web3(process.env.BSC_NODE_URL);
const mazolContract = new web3.eth.Contract(
  JSON.parse(process.env.MAZOL_ABI), 
  process.env.MAZOL_ADDRESS
);

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/ico', require('./routes/ico'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
