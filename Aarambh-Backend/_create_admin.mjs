import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './src/models/user.model.js';

dotenv.config();

const EMAIL = 'admin@aarambh.com';
const PASSWORD = 'Admin@123';
const NAME = 'Admin';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aarambh_db';
await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

let user = await User.findOne({ email: EMAIL });
if (user) {
  user.role = 'admin';
  user.password = PASSWORD; // re-hashed by pre-save hook
  user.isEmailVerified = true;
  await user.save();
  console.log(`♻️  Existing user promoted to admin: ${EMAIL}`);
} else {
  user = await User.create({
    name: NAME,
    email: EMAIL,
    password: PASSWORD, // hashed by pre-save hook
    role: 'admin',
    authProvider: 'local',
    isEmailVerified: true,
  });
  console.log(`✅ Admin created: ${EMAIL}`);
}

console.log('   _id: ', user._id.toString());
console.log('   role:', user.role);
console.log(`   login -> email: ${EMAIL}  password: ${PASSWORD}`);

await mongoose.disconnect();
