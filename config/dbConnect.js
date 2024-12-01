const mongoose = require('mongoose');

// MongoDB Connection
const dbConnect = async () => {
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(
            `Connected to my authentication_MongoDB Atlas: ${connect.connection.host}, | ${connect.connection.name}`
        );
    } catch (err) {
        console.error('MongoDB connection failed:', err);
        process.exit(1); // Exit the process with failure
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Attendee', 'Organizer', 'Admin'], default: 'Attendee' },
});

// User Model
const User = mongoose.model('User', userSchema);

// Export Both
module.exports = { dbConnect, User };
