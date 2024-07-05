const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const chatSchema = Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User' },
    nickName: { type: String },
    profileImage: { type: String },
    message: { type: String },
    systemMessage: { type: String }
}, { timestamp: true })

const chatRoomSchema = Schema({
    host: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: mongoose.Types.ObjectId, ref: 'MeetUp', required: true },
    participants: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    chat: [ chatSchema ]
})

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema)
module.exports = ChatRoom