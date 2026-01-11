import { asyncHandler } from "../../utils/asyncHandler.js";
import { Chat } from '../../Models/chat.models.js'
import { User } from '../../Models/auth.models.js'
import { geminiGenerate } from '../../Utils/gemini.js'
import axios from "axios";
import { getImageKit } from "../../Utils/imageKit.js";

// Text based AI Chat message Controller
const testMessageController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    console.log("User Id: ", req.user?._id);

    const { chatId, prompt } = req.body;
    console.log("Chat Id: ", chatId);
    console.log("Prompt: ", prompt);

    if (!prompt || !chatId) {
        return res.status(400).json({
            success: false,
            message: "Prompt and Chat ID Missing"
        });
    }

    // Find the chat
    const chat = await Chat.findOne(
        {
            _id: chatId,
            user: userId
        }
    )

    if (!chat) {
        return res.status(404).json({
            success: false,
            message: "Chat not found"
        })
    }

    // Deduct 1 credit from user for each text message
    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, credits: { $gte: 1 } },
        { $inc: { credits: -1 } },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(400).json({
            success: false,
            message: "Not enough credits",
        });
    }

    // Push user message to chat
    chat.messages.push({
        role: "user",
        content: prompt,
        timestamp: Date.now(),
        isImage: false,
        isPublished: false
    })

    // Generate AI response using Gemini API
    const contents = chat.messages.slice(-20).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content) }]
    }));

    // Add the new user prompt LAST (important)
    // contents.push({
    //     role: "user",
    //     parts: [{ text: String(prompt).trim() }]
    // });

    const aiText = await geminiGenerate(contents);


    const reply = {
        role: "assistant",
        content: aiText,
        timestamp: Date.now(),
        isImage: false
    };
    console.log(reply);

    chat.messages.push(reply) // Push AI response to chat
    await chat.save()

    res.status(200).json({
        success: true,
        message: "Message processed successfully",
        data: reply,
        credits: updatedUser.credits
    })

})

const imageGenerationController = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    console.log("User Id: ", req.user?._id);

    const { chatId, prompt, isPublished } = req.body;
    console.log("Chat Id: ", chatId);
    console.log("Prompt: ", prompt);

    if (!prompt || !chatId) {
        return res.status(400).json({
            success: false,
            message: "Prompt and Chat ID Missing"
        })
    }

    // Find the chat
    const chat = await Chat.findOne(
        {
            _id: chatId,
            user: userId
        }
    )

    if (!chat) {
        return res.status(404).json({
            success: false,
            message: "Chat not found"
        })
    }

    // Deduct 3 credit from user for each text message
    const updatedUser = await User.findOneAndUpdate(
        { _id: userId, credits: { $gte: 3 } },
        { $inc: { credits: -3 } },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(400).json({
            success: false,
            message: "Not enough credits",
        });
    }

    // Push user message to chat
    chat.messages.push({
        role: "user",
        content: prompt,
        timestamp: Date.now(),
        isImage: false,
        isPublished: isPublished || false
    })

    // Encode the prompt
    const encodedPrompt = encodeURIComponent(prompt);

    // Generate image using Gemini API
    console.log("URL_ENDPOINT:", process.env.IMAGEKIT_URL_ENDPOINT);
    const generatedImageURL = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

    const aiImageResponse = await axios.get(generatedImageURL, {
        responseType: 'arraybuffer'  // Ensure the image is fetched correctly
    });

    if (aiImageResponse.status !== 200) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate image"
        })
    }

    // Convert image data to base64
    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse?.data, 'binary').toString('base64')}`;

    // Upload image to ImageKit.io
    const imageKit = getImageKit();
    const uploadResponse = await imageKit.upload({
        file: base64Image,
        fileName: `ai-image-${Date.now()}.png`,
        folder: "quickgpt/images"
    })

    if (!uploadResponse?.url) {
        return res.status(500).json({
            success: false,
            message: "Failed to upload image"
        })
    }

    const reply = {
        role: "assistant",
        content: uploadResponse.url,
        timestamp: Date.now(),
        isImage: true,
        isPublished: isPublished || false
    }

    chat.messages.push(reply)
    await chat.save()

    if (!reply) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate image response"
        })
    }

    return res.status(200).json({
        success: true,
        message: "Image generated successfully",
        data: reply,
        credits: updatedUser.credits
    })

})

export { testMessageController, imageGenerationController }