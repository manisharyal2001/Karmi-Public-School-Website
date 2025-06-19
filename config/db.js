const mongoose = require('mongoose');

const connectDB = async () => {
    const maxRetries = 3;
    let retries = maxRetries;

    const connect = async () => {
        try {
            console.log('Attempting to connect to MongoDB...');
            await mongoose.connect(process.env.MONGODB_URI, {
                dbName: 'karmipublicschool'
            });
            console.log('MongoDB Connected Successfully!');
            return true;
        } catch (error) {
            console.error('MongoDB Connection Error:', error.message);
            return false;
        }
    };

    while (retries > 0) {
        const connected = await connect();
        if (connected) return;

        retries--;
        if (retries > 0) {
            console.log(`Retrying connection in 5 seconds... (attempts remaining: ${retries})`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            console.log(`Connecting to MongoDB (attempts remaining: ${retries})...`);
        }
    }

    if (retries === 0) {
        console.error('Failed to connect after multiple attempts. Exiting...');
        process.exit(1);
    }
};

module.exports = connectDB; 