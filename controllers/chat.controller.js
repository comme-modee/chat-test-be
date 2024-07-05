const ChatRoom = require("../model/ChatRoom");
const User = require("../model/User");
const chatController = {}
let io;

//io를 chatController에서 사용하기 위해 가져옴
chatController.useSocketIo = (socketIo) => {
    io = socketIo;
}

chatController.createChatRoom = async ({ host, roomId }) => {
    try {

        const findHost = await User.findById(host)
        if(!findHost) throw new Error('유저를 찾을 수 없습니다')
        
        //채팅방 생성. 
        //생성할때 파티원에 호스트를 포함시킴
        const chatRoom = new ChatRoom({
            host,
            roomId,
            participants: [host],
            chat: {
                systemMessage: `${findHost.nickName} 님이 들어왔습니다`
            }
        })

        await chatRoom.save();
        console.log('chatRoom', chatRoom)
    } catch (error) {
        console.error("채팅방 생성 오류:", error.message);
    }
}

chatController.getChatRoomList = async (req, res) => {
    try {
        const { userId } = req; 
        const user = await User.findById(userId)
        if(!user) throw new Error('유저를 찾을 수 없습니다')
        
        const findChatRoomList = await ChatRoom.find({ participants: { $in: userId } }).populate({
            path: "host",
            select: "nickName"
        }).populate({
            path: "participants",
            select: "nickName profileImage"
        }).populate({
            path: "roomId",
            // select: "title image category currentParticipants"
        })

        res.status(200).json({ status: "success", chatRoomList: findChatRoomList });
    } catch (error) {
        res.status(400).json({ status: "fail", message: error.message });
    }
}

chatController.addParticipant = async ({ userId, roomId }) => {
    try {
        const findUser = await User.findById(userId)
        if(!findUser) throw new Error('유저를 찾을 수 없습니다')
            
        const findChatRoom = await ChatRoom.findOne({ roomId })
        if(!findChatRoom) throw new Error('채팅방을 찾을 수 없습니다')

        findChatRoom.participants.push(userId)

        const systemMessage = {
            systemMessage: `${findUser.nickName} 님이 들어왔습니다`
        }
        io.emit('message', systemMessage)
        findChatRoom.chat.push(systemMessage)

        await findChatRoom.save();
    } catch (error) {
        console.log(error.message)
    }
}

chatController.removeParticipant = async ({ userId, roomId }) => {
    try {
        const findUser = await User.findById(userId)
        if(!findUser) throw new Error('유저를 찾을 수 없습니다')
            
        const findChatRoom = await ChatRoom.findOne({ roomId })
        if(!findChatRoom) throw new Error('채팅방을 찾을 수 없습니다')

                                                                    // ObjectId 비교를 위해 equals 메서드 사용
        findChatRoom.participants = findChatRoom.participants.filter((user) => !user.equals(userId))

        const systemMessage = {
            systemMessage: `${findUser.nickName} 님이 나갔습니다`
        }
        io.emit('message', systemMessage)
        findChatRoom.chat.push(systemMessage)
        
        await findChatRoom.save();
    } catch (error) {
        console.log(error.message)
    }
}

chatController.getChatMessageList = async (roomId) => {
    try {
        const findChatRoom = await ChatRoom.findOne({ roomId })
        if(!findChatRoom) throw new Error('채팅방을 찾을 수 없습니다')

        const chatMessageList = findChatRoom.chat

        return chatMessageList
    } catch (error) {
        return error.message
    }
}

chatController.saveMessage = async ({ roomId, message, userId }) => {
    try {
        const findChatRoom = await ChatRoom.findOne({ roomId })
        if(!findChatRoom) throw new Error('채팅방을 찾을 수 없습니다')

        const findUser = await User.findById(userId);
        if(!findUser) throw new Error('유저를 찾을 수 없습니다')

        const newMessage = {
            userId: findUser._id,
            nickName: findUser.nickName,
            profileImage: findUser.profileImage,
            message
        }
        
        findChatRoom.chat.push(newMessage)
        await findChatRoom.save();

        return newMessage;
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = chatController;