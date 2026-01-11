import { Chat } from "../../Models/chat.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const createChat = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    console.log("User Id: ", req.user?._id);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    const chatData = {
        user: userId,
        userName: req.user?.username,
        chatName: req.body?.chatName || "New Chat",
        messages: []
    }

    const newChat = await Chat.create(chatData)
    if (!newChat) {
        return res.status(400).json({
            success: false,
            message: "Failed to create chat"
        })
    }

    return res.status(201).json({
        success: true,
        message: "Chat created successfully",
        data: newChat
    })

})

const getChatData = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    console.log("User Id: ", req.user?._id);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    const chats = await Chat.find({ user: userId }).sort({ createdAt: -1 })
    if (chats.length === 0) {
        return res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            data: chats,
        });

    }

    return res.status(200).json({
        success: true,
        message: "Chats retrieved successfully",
        data: chats
    })
})

const deleteChat = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    console.log("User Id: ", req.user?._id);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        })
    }

    const { chatId } = req.params
    console.log("Chat Id: ", req.params);

    const deletedChat = await Chat.findOneAndDelete(
        {
            _id: chatId,
            user: userId
        }
    )

    if (!deletedChat) {
        return res.status(404).json({
            success: false,
            message: "Chat not found or you are not authorized to delete this chat"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Chat deleted successfully",
        data: deletedChat
    })
})

export { createChat, getChatData, deleteChat }