import mongoose from 'mongoose'

const groupSchema = new mongoose.Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    id: {
        type: String,
        unique: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteCode: {
        type: String,
        unique: true
    },
    allowNewParticipants: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);

export default Group;