import { model, Schema } from "mongoose";

const chatSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    chatName: {
        type: String,
        required: true,
    },
    messages: [
        {
            isImage: {
                type: Boolean,
                default: false,
            },
            isPublished: {
                type: Boolean,
                default: false,
            },
            role: {
                type: String,
                // enum: ["user", "bot"],
                required: true,
            },
            content: {
                type: String,
                required: true,
            }
        }
    ]
}, { timestamps: true })

export const Chat = model("Chat", chatSchema)