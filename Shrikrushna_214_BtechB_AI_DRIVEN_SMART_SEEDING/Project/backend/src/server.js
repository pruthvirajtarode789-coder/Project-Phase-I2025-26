// const express = require('express');
import express from 'express';
// const dotenv = require('dotenv');
import dotenv from 'dotenv';
// const cors = require('cors');
import cors from "cors"
// const mongoose = require('mongoose');
import mongoose from 'mongoose';
// const authRoutes = require('./routes/auth.js');
import authRoutes from "./routes/auth.js"


dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});