const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const indexRouter = require("./routes/index");
const chatController = require("./controllers/chat.controller");
require("dotenv").config();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mongoURI = process.env.MONGODB_URI_PROD;
const PORT = process.env.PORT || 5000;

mongoose
    .connect(mongoURI)
    .then(() => console.log("mongoose connected"))
    .catch((error) => console.log("DB connection failed", error));

app.use("/api", indexRouter);

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        // origin: 'https://dev-ing-with-chat.netlify.app'
        origin: 'http://localhost:3000'
    },
});

require("./utils/io")(io);

//챗컨트롤러에서 io사용하기 위해 전달
chatController.useSocketIo(io)

httpServer.listen(PORT, () => {
    console.log("server listening on port", PORT);
});
