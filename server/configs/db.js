import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('✅ Database connected'));
        
        // Force IPv4 to bypass IPv6 issue
        await mongoose.connect(process.env.MONGODB_URI, {
            family: 4  // ← This forces IPv4
        });
        
        console.log('✅ MongoDB connection successful');
    } catch (error) {
        console.log('❌ MongoDB Error:', error.message);
    }
};

export default connectDB;