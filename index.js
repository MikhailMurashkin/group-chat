import express from 'express'
import { createServer } from 'node:http';
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import { Server } from 'socket.io';

import dotenv from 'dotenv'
dotenv.config()


const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3001"
    }
});

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

mongoose.connect("mongodb+srv://murashkinmp:admin@cluster0.49nbo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" || process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));



app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);

// app.get('/add', (req, res) => {
//     // io.emit('')
// })

io.on('connection', (socket) => {
    console.log('a user connected');
    
    socket.emit('message', 'hi');

    socket.on('message', (msg, callback) => {
        console.log('message: ' + msg);
        callback(`Got your message: ${msg}`)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
  


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});