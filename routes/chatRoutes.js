import express from 'express'
import moment from 'moment-timezone'

import User from '../models/User.js'
import Group from '../models/Group.js'
import GroupMatch from '../models/GroupMatch.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

import protect from '../middleware/authMiddleware.js'

const chatRoutes = express.Router()

const moscowTime = moment.tz("Europe/Moscow")

chatRoutes.post('/getChatData', protect, async (req, res) => {
    try {
        const { groupId } = req.body
        Chat.findOne({
            $or: [{groupId1: groupId}, {groupId2: groupId}],
            isActive: true
        }).then(chat => {
            if(!chat) {
                res.status(400).json({ message: 'No active chat' });
            } else {
                // add: check is user in one of the groups
                Message.find({
                    chatId: chat.chatId
                }).then(messages => {
                    let messagesList = []
                    messages.forEach(message => {
                        messagesList.push({
                            authorId: message.authorId,
                            isFromMyGroup: groupId == message.groupId ? true : false,
                            date: message.date
                        })
                    })

                    res.status(200).json({ messagesList })
                })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})

chatRoutes.post('/sendMessage', protect, async (req, res) => {
    try {
        const { groupId, message } = req.body
        Chat.findOne({
            $or: [{groupId1: groupId}, {groupId2: groupId}],
            isActive: true
        }).then(chat => {
            if(!chat) {
                res.status(400).json({ message: 'No active chat' })
            } else {
                // add: check is user in one of the groups
                let newMessage = new Message({
                    groupId,
                    message,
                    authorId: req.user,
                    chatId: chat.chatId,
                    date: Date.now()
                })

                newMessage.save().then(message => {
                    res.status(200).json({ message: 'added' })
                })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})


export default chatRoutes