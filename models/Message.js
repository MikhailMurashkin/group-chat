import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    // id: {
    //     type: String
    // },
    message: {
        type: String
    },
    authorId: {
        type: String
    },
    groupId: {
        type: String
    },
    chatId: {
        type: String
    },
    date: {
        type: Date
    },
    type: {
        type: String,
        default: 'message'
    }
}, { timestamps: true })

const Message = mongoose.model('Message', messageSchema)

export default Message