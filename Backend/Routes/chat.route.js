import { Router } from "express";
import { verifyJWT } from "../Middleware/auth.middleware.js";
import { createChat, deleteChat, getChatData } from "../Controller/Chat/chat.controller.js";

const router = Router();

router.route('/create').post(verifyJWT, createChat)
router.route('/get').get(verifyJWT, getChatData)
router.route('/delete/:chatId').delete(verifyJWT, deleteChat)

export default router