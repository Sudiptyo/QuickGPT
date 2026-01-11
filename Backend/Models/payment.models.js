import { model, Schema } from "mongoose";

const paymentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    planId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    razorpayPaymentLinkId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    isRefunded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Payment = model("Payment", paymentSchema);
