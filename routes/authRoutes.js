import express from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import protect from '../middleware/authMiddleware.js';
const authRoutes = express.Router();

authRoutes.post('/register', async (req, res) => {
    try {
        console.log("register")
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ name, email, password });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        res.status(201).json({ token, userId: user._id, name: user.name });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
});

authRoutes.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        res.json({ token, userId: user._id, name: user.name });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

authRoutes.get('/me', protect, async (req, res) => {
    try {
      const user = await User.findById(req.user).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
});

export default authRoutes;