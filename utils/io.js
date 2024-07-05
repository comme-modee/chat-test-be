const chatController = require("../controllers/chat.controller");
const userController = require("../controllers/user.controller");

module.exports = function (io) {
    io.on("connection", async (socket) => {
        console.log("connected: ", socket.id);
        socket.on('user', async (userId, callback) => {
            try {
                const findUser = await userController.userOnlineState({ userId, socketId: socket.id, online: true })
                callback({ ok: true, data: findUser })
            } catch (error) {
                callback({ ok: false, error })
            }
        })

        socket.on('enterChatRoom', async (roomId, callback) => {
            console.log('채팅방 id는: ', roomId)

            //roomId로 채팅방을 찾아 채팅내용을 보내준다.
            const chatMessageList = await chatController.getChatMessageList(roomId)
            if(chatMessageList.length > 0) {
                callback({ ok: true, data: chatMessageList })
            } else {
                callback({ ok: false, error: '채팅내용이 없습니다' })
            }
        })

        socket.on('sendMessage', async ({ roomId, message, userId }, callback) => {
            console.log('받은 메세지는: ', roomId, message, userId)
            const newMessage = await chatController.saveMessage({ roomId, message, userId })

            console.log('newMessage', newMessage)

            //newMessage를 채팅방에 있는 모두에게 io가 알려줌
            io.emit('message', newMessage)

            callback({ ok: true, data: newMessage })
        })

        //socket을 받은 후에 socket의 연결이 끊길 경우 진행되는 로직
        socket.on('disconnect', async () => {
            console.log('user is disconnected', socket.id);
            await userController.userOnlineState({ userId: null, socketId: socket.id, online: false })
        })
    });
}