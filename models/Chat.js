import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
    groupId1: {
        type: String
    },
    groupId2: {
        type: String
    },
    isActive: {
        type: Boolean
    },
    chatId: {
        type: String
    },
    closedDate: {
        type: Date
    },
    open: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Chat = mongoose.model('Chat', chatSchema)

export default Chat