//ACCESS DB
const mongoose = require("mongoose");
//CONNECT TO MONGODB - using uri from .env
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {family: 4});
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = connectDB;