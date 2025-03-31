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
    creatorId: {
        type: String,
        required: true
    },
    participantsId: [{
        type: String
    }],
    inviteCode: {
        type: String,
        unique: true
    },
    complete: {
        type: Boolean,
        default: false
    },
    inSearch: {
        type: Boolean,
        default: false
    },
    searchDate: {
        type: Date
    }
    // chatGroupId: {
    //     type: String
    // }
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);

export default Group;