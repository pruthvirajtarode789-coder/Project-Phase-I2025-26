// const express = require('express');
import express from 'express';
// const { signup, login } = require('../controllers/authController.js');
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/auth/signup
router.post('/signup', signup);

// @route   POST /api/auth/login
router.post('/login', login);

export default router;
