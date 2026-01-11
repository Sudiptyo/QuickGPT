import { Router } from "express";
import { verifyJWT } from "../Middleware/auth.middleware.js";
import { imageGenerationController, testMessageController } from "../Controller/Chat/message.controller.js";

const router = Router();

router.route('/text').post(verifyJWT, testMessageController)
router.route('/image').post(verifyJWT, imageGenerationController)

export default router;
