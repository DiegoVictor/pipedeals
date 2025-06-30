import mongoose from 'mongoose';

const connection = mongoose.connect(process.env.MONGO_URL);

export default connection;
