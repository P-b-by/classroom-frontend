#!/usr/bin/env node
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';

// 1. Check if a password was passed in the terminal command
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node server/reset-admin.js <new-password>');
  process.exit(1);
}
const newPassword = args[0];

// 2. Define the Admin Schema to find it in MongoDB
const AdminSchema = new mongoose.Schema({
  passwordHash: String
});
const Admin = mongoose.model('Admin', AdminSchema);

async function run() {
  // Use local .env file or Render system variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in your environment variables / .env file.');
    process.exit(2);
  }

  try {
    // 3. Connect to the Cloud Database
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);

    // 4. Hash the new password securely
    const hash = await bcrypt.hash(newPassword, 10);

    // 5. Update the password or create the admin profile if it is missing
    const adminRecord = await Admin.findOne({});
    if (adminRecord) {
      adminRecord.passwordHash = hash;
      await adminRecord.save();
    } else {
      const newAdmin = new Admin({ passwordHash: hash });
      await newAdmin.save();
    }

    console.log('🎉 Success! Admin password has been securely reset in MongoDB Atlas.');
    process.exit(0);
  } catch (e) {
    console.error('Failed to reset admin password:', e.message);
    process.exit(3);
  } finally {
    // Always close the database link when the script finishes
    await mongoose.disconnect();
  }
}

run();
