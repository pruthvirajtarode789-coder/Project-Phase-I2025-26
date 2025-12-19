// const User = require('../models/User.js');
import User from "../models/User.js"
// const bcrypt = require('bcryptjs');
import bcrypt from "bcryptjs";
// const jwt = require('jsonwebtoken');
import jwt from "jsonwebtoken"

export const signup = async (req, res) => {
  const { email, password, phoneNumber } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
    if (user) {
      return res.status(400).json({ message: 'User with this email or phone number already exists.' });
    }

    // Create new user
    user = new User({
      email,
      password,
      phoneNumber,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully!' });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Create and return JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
};
