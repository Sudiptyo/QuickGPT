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