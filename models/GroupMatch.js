import mongoose from 'mongoose'

const groupMatchSchema = new mongoose.Schema({
    id1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    id2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    },
    date: {
        type: Date
    }
}, { timestamps: true });

const GroupMatch = mongoose.model('GroupMatch', groupMatchSchema);

export default GroupMatch;