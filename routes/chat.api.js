const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const chatController = require("../controllers/chat.controller");

router.get("/", authController.authenticate, chatController.getChatRoomList);

module.exports = router;
