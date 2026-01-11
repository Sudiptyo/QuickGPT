import { Payment } from "../../Models/payment.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../Models/auth.models.js";
import crypto from 'crypto'
import { getRazorpay } from '../../Utils/razorPay.js'
import { generateInvoice } from "../../Utils/invoice.js";
import { sendInvoiceEmail } from '../../Utils/sendEmail.js'

const plans = [
    {
        _id: "basic",
        name: "Basic",
        price: 59,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 159,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 299,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
];

// Get all plans
const getPlans = asyncHandler(async (req, res) => {
    return res.status(200).json({
        success: true,
        data: plans
    });
})

// Purchase a plan
const purchasePlan = asyncHandler(async (req, res) => {
    const { planId } = req.body;
    console.log("BODY:", req.body);

    const userId = req.user?._id;
    console.log("USER:", req.user?._id);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "User not authenticated"
        });
    }

    const plan = plans.find(p => p._id === planId);
    if (!plan) {
        return res.status(400).json({
            success: false,
            message: "Invalid Plan ID"
        });
    }

    const razorpay = getRazorpay();

    const paymentLink = await razorpay.paymentLink.create({
        amount: plan.price * 100,
        currency: "INR",
        customer: {
            name: req.user?.username || "User",
            email: req.user?.email
        },
        description: `plan_${planId}_${Date.now()}...${plan.name} plan purchased`,
        notes: {
            userId: userId.toString(),
            planId: plan._id
        }
    });

    const payment = await Payment.create({
        userId,
        planId: plan?._id,
        amount: plan?.price,
        credits: plan?.credits,
        razorpayPaymentLinkId: paymentLink.id,
        isPaid: false
    });

    res.status(200).json({
        success: true,
        message: "Payment link generated successfully",
        paymentUrl: paymentLink.short_url,
        paymentId: payment?._id
    });
});

const verifyPaymentWebhook = asyncHandler(async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
        throw new Error("Webhook secret not configured");
    }

    const signature = req.headers["x-razorpay-signature"];

    const expected = crypto
        .createHmac("sha256", secret)
        .update(req.body)
        .digest("hex");

    if (expected !== signature) {
        return res.status(400).json({ success: false });
    }

    const event = JSON.parse(req.body.toString())
    if (event?.event !== "payment_link.paid") {
        return res.status(200).json({ success: true });
    }

    console.log("🔔 Webhook:", event.event);

    const paymentLink = event?.payload?.payment_link?.entity;
    const userId = paymentLink?.notes?.userId;

    const session = await Payment.startSession();
    session.startTransaction();

    try {
        const payment = await Payment.findOne({
            razorpayPaymentLinkId: paymentLink.id,
        }).session(session);

        if (!payment || payment.isPaid) {
            await session.commitTransaction();
            session.endSession();
            return res.json({ success: true });
        }

        payment.isPaid = true;
        await payment.save({ session });

        await User.updateOne(
            { _id: userId },
            { $inc: { credits: payment.credits } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(200)
            .json(
                {
                    success: true
                }
            );

        await generateInvoice(payment, { _id: userId })
            .then(pdf =>
                sendInvoiceEmail({
                    to: event.payload.payment_link.entity.customer.email,
                    pdfBuffer: pdf,
                    payment
                })
            )
            .catch(console.error);

    } catch (err) {
        console.error("Webhook error", err);
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
});

// const refundPayment = asyncHandler(async (req, res) => {
//     const { paymentId } = req.body;

//     const payment = await Payment.findById(paymentId);
//     if (!payment || !payment.isPaid) {
//         return res.status(400).json({ message: "Invalid payment" });
//     }

//     if (payment.isRefunded) {
//         return res.status(400).json({ message: "Already refunded" });
//     }

//     const user = await User.findById(payment.userId);
//     if (user.credits < payment.credits) {
//         return res.status(400).json({
//             message: "Credits already used, refund not allowed"
//         });
//     }

//     const razorpay = getRazorpay();
//     const session = await Payment.startSession();
//     session.startTransaction();

//     try {
//         await razorpay.payments.refund(payment.razorpayPaymentId);

//         payment.isRefunded = true;
//         await payment.save({ session });

//         await User.updateOne(
//             { _id: payment.userId },
//             { $inc: { credits: -payment.credits } },
//             { session }
//         );

//         await session.commitTransaction();
//         session.endSession();

//         res.json({
//             success: true,
//             message: "Refund successful"
//         });

//     } catch (err) {
//         await session.abortTransaction();
//         session.endSession();
//         throw err;
//     }
// });

export { getPlans, purchasePlan, verifyPaymentWebhook };