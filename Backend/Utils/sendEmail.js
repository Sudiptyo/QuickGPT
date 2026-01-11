import dotenv from 'dotenv'
dotenv.config();

import nodemailer from "nodemailer";

const sendInvoiceEmail = async ({ to, pdfBuffer, payment }) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"QuickGPT" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your QuickGPT Invoice",
        text: "Thank you for your purchase. Invoice attached.",
        attachments: [
            {
                filename: `invoice_${payment._id}.pdf`,
                content: pdfBuffer
            }
        ]
    });
};

export { sendInvoiceEmail }