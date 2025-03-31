import express from 'express'
import { createServer } from 'node:http'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

import Chat from './models/Chat.js'
import Message from './models/Message.js'

import dotenv from 'dotenv'
import Group from './models/Group.js'
dotenv.config()


const app = express()
const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001"
    },
    connectionStateRecovery: {}
})

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

mongoose.connect("mongodb+srv://murashkinmp:admin@cluster0.49nbo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" || process.env.MONGO_URI, {
    family: 4
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err))



app.use('/auth', authRoutes)
app.use('/groups', groupRoutes)
app.use('/chat', chatRoutes)



let namespaces = {}

io.on('connection', (socket) => {

    socket.emit('message', 'Sombody connected')

    socket.on('joinChat', (chatId) => {
        socket.join(chatId)
        console.log(`User ${socket.id} joined chat ${chatId} !`)
    })



    socket.on('message', (chatId, groupId, message, token) => {
        if (!token) {
            socket.emit('error', 'Not authorized, no token')
        }
        try {
            const userId = jwt.verify(token, process.env.JWT_SECRET).id
            Chat.findOne({
                $or: [{groupId1: groupId}, {groupId2: groupId}],
                isActive: true
            }).then(chat => {
                if(!chat) {
                    socket.emit('error', 'No active chat')
                } else {
                    // add: check is user in one of the groups
                    let newMessage = new Message({
                        groupId,
                        message,
                        authorId: userId,
                        chatId: chat._id,
                        date: Date.now()
                    })
    
                    console.log("message: ", message)
                    newMessage.save().then(message => {
                        io.to(chatId).emit('message', 'New')
                    })
                }
            })
        } catch (error) {
            console.log(error)
            socket.emit('error', 'Server error')
        }
    })

    socket.on('open', async (chatId, groupId, token) => {
        if (!token) {
            socket.emit('error', 'Not authorized, no token')
        }
        try {
            const userId = jwt.verify(token, process.env.JWT_SECRET).id;
            let chat = await Chat.findOne({
                $or: [{groupId1: groupId}, {groupId2: groupId}],
                isActive: true
            })
            if(!chat) {
                return socket.emit('error', 'No active chat')
            }
            let group = await Group.findOne({
                id: groupId,
                creatorId: userId
            })
            if(!group) {
                return socket.emit('error', 'No permission')
            }
            console.log(chat)

            

            let openMessageFromOtherGroup = await Message.findOne({
                chatId: chat._id,
                type: 'open',
                groupId: {$ne: groupId }
            })

            if(!openMessageFromOtherGroup) {
                let newMessage = new Message({
                    groupId,
                    authorId: userId,
                    chatId: chat._id,
                    date: Date.now(),
                    type: 'open'
                })
                newMessage.save().then(message => {
                    io.to(chatId).emit('message', 'New');
                })
            } else {
                await Chat.findByIdAndUpdate(chat._id, {
                    open: true
                })
                let newMessage = new Message({
                    groupId,
                    authorId: userId,
                    chatId: chat._id,
                    date: Date.now(),
                    type: 'opened'
                })
                newMessage.save().then(message => {
                    io.to(chatId).emit('message', 'New');
                })
            }

        } catch (error) {
            socket.emit('error', 'Server error')
        }
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})
  


const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});