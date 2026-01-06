import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/db.js";
import { app } from "./App.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB().then(() => {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            })
        }).catch((err) => {
            console.error("Failed to connect to MongoDB:", err.message);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
    }
}

startServer();