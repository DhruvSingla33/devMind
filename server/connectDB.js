const mongoose = require('mongoose');
require('dotenv').config(); 

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`Database Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); 
    }
}

module.exports = connectDB;
