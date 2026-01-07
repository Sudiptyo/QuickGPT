import { connect } from "mongoose";

const connectDB = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("🚀 MongoDB Connected successfully");
    } catch (err) {
        console.log("Couldn't Connect to MongoDB", err);
    }
}

export default connectDB;