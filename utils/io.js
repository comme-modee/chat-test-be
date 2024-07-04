module.exports = function (io) {
    io.on("connection", async (socket) => {
        console.log("connected: ", socket.id);

        socket.on('chatIn', async (nickName, userId, callback) => {
            console.log('유저아이디는: ', userId, '유저이름은: ', nickName)
            callback({ ok: true, data: userId })
        })
    });
}