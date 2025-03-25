import express from 'express';

import User from '../models/User.js';
import Group from '../models/Group.js';
import protect from '../middleware/authMiddleware.js';
const groupRoutes = express.Router();

groupRoutes.post('/createGroup', protect, async (req, res) => {
    try {
        const { groupName, groupDescription } = req.body;

        const group = await Group.create({
            name: groupName,
            description: groupDescription,
            id: generateGroupId(),
            creator: req.user,
            participants: [req.user],
            inviteCode: generateInviteCode()
        });

        res.status(201).json({ groupId: group.id });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' });
    }
});

groupRoutes.get('/getGroupsByUserId', protect, async (req, res) => {
    try {
        const groups = await Group.find({creator: req.user});

        res.json({ groups });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

groupRoutes.get('/me', protect, async (req, res) => {
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


const generateInviteCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

const generateGroupId = () => {
    const characters = 'qwertyuiopasdfghjklzxcvbnm0123456789';
    let code = '';
    for (let i = 0; i < 33; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

export default groupRoutes;