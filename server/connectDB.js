const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Good to add options for future-proofing
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`Database Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit process with failure
    }
}

module.exports = connectDB;
