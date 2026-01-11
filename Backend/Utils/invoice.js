import PDFDocument from "pdfkit";

const generateInvoice = async (payment, user) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const buffers = [];

        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {
            const pdfBuffer = Buffer.concat(buffers);
            resolve(pdfBuffer);
        });

        doc.fontSize(20).text("QuickGPT Invoice", { align: "center" });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Invoice ID: ${payment._id}`);
        doc.text(`Customer: ${user.email}`);
        doc.text(`Plan: ${payment.planId}`);
        doc.text(`Amount Paid: ₹${payment.amount}`);
        doc.text(`Credits Added: ${payment.credits}`);
        doc.text(`Payment ID: ${payment.razorpayPaymentId}`);
        doc.text(`Date: ${new Date(payment.createdAt).toLocaleString()}`);

        doc.moveDown();
        doc.text("Thank you for using QuickGPT 💙");

        doc.end();
    });
};

export { generateInvoice };