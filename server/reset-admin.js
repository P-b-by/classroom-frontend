#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcrypt';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node server/reset-admin.js <new-password>');
  process.exit(1);
}
const newPassword = args[0];
const dbPath = path.join(process.cwd(), 'server', 'db.json');

async function run() {
  try {
    const raw = await fs.readFile(dbPath, 'utf8');
    const db = JSON.parse(raw);
    const hash = await bcrypt.hash(newPassword, 10);
    db.admin = db.admin || {};
    db.admin.passwordHash = hash;
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log('Admin password reset in server/db.json');
  } catch (e) {
    console.error('Failed to reset admin password:', e.message);
    process.exit(2);
  }
}

run();
