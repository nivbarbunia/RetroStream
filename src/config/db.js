//ACCESS DB
const mongoose = require("mongoose");
const logger = require("../utils/logger");
//CONNECT TO MONGODB - using uri from .env
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {family: 4});
        console.log("MongoDB connected successfully");
    } catch (error) {
        logger.logError("MongoDB connection failed", error);
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;