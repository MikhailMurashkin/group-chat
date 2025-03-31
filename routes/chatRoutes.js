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
                User.find({}).then(users => {
                    Message.find({
                        chatId: chat._id
                    }).then(async messages => {
                        let messagesList = []
                        messages.forEach(message => {
                            let userName = ''
                            let userImage = ''
                            users.forEach(user => {
                                if(user.id == message.authorId){
                                    userName = user.name
                                    userImage = user.image
                                }
                            })
                            
                            let isFromMyGroup = groupId == message.groupId ? true : false

                            messagesList.push({
                                message: message.message,
                                authorId: message.authorId,
                                name: userName,
                                isFromMyGroup,
                                date: message.date,
                                type: message.type,
                                image: isFromMyGroup || chat.open ? userImage : ''
                            })
                        })

                        let openMessage = await Message.findOne({
                            chatId: chat._id,
                            groupId,
                            $or: [{type: 'open'}, {type: 'opened'}]
                        })

                        let foundGroupId = chat.groupId1 == groupId ? chat.groupId2 : chat.groupId1
                        let foundGroup = await Group.findOne({
                            id: foundGroupId
                        })

                        let myGroup = await Group.findOne({
                            id: groupId
                        })



                        let openMessages = messages

                        res.status(200).json({ messagesList, chatId: chat._id, 
                            foundGroupName: foundGroup.name,
                            open: chat.open,
                            sentOpen: openMessage ? true : false,
                            isCreator: myGroup.creatorId == req.user
                        })
                    })
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
                    chatId: chat._id,
                    date: Date.now()
                })

                newMessage.save().then(message => {
                    console.log(message)
                    res.status(200).json({ message: 'added' })
                })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})


chatRoutes.post('/closeChat', protect, async (req, res) => {
    try {
        const { groupId, message } = req.body
        Group.findOne({
            id: groupId,
            creatorId: req.user
        }).then(group => {
            if(!group){
                return res.status(400).json({ message: 'Server error' })
            }
            Chat.findOneAndUpdate({
                $or: [{groupId1: groupId}, {groupId2: groupId}],
                isActive: true
            }, {
                isActive: false
            }).then(async chat => {
                if(!chat) {
                    return res.status(400).json({ message: 'Server error' })
                }
                await Group.findOneAndUpdate({
                    id: chat.groupId1
                }, {
                    complete: false
                })
                await Group.findOneAndUpdate({
                    id: chat.groupId2
                }, {
                    complete: false
                })
                res.status(200).json({ message: 'chat closed' })
                
            })
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error' })
    }
})


export default chatRoutes