import mongoose from 'mongoose'

const groupMatchSchema = new mongoose.Schema({
    groupId1: {
        type: String
    },
    groupId2: {
        type: String
    },
    groupDecision1: {
        type: String,
        default: 'No descision'
    },
    groupDecision2: {
        type: String,
        default: 'No descision'
    },
    date: {
        type: Date
    }
}, { timestamps: true });

const GroupMatch = mongoose.model('GroupMatch', groupMatchSchema);

export default GroupMatch;