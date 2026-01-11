import dotenv from 'dotenv'
dotenv.config();

import connectDB from './db/db.js';
import { app } from './App.js';

const PORT = process.env.PORT || 3000

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`⚙️  Server is running on port ${PORT}`);
        })
    } catch (err) {
        console.log("Error starting server:", err);
    }
}

startServer();

app.use((err, req, res, next) => {
    console.error("🔥 GLOBAL ERROR HANDLER 🔥");
    console.error(err);

    res.status(err.statusCode || err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: err
    });
});
