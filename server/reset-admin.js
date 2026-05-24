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

// Password validation function
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 12) {
    return { valid: false, error: 'Password must be at least 12 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }
  return { valid: true };
}

async function run() {
  // Use local .env file or Render system variables
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Error: MONGODB_URI is not defined in your environment variables / .env file.');
    process.exit(2);
  }

  // Validate password strength
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    console.error('Password validation failed:', passwordValidation.error);
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
