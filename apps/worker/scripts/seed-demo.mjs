import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function hashPasswordNode(password) {
  const iterations = 100_000;
  const salt = crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return `pbkdf2_sha256$${iterations}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

const now = new Date().toISOString();
const demoUsers = [
  { id: 'usr_demo_resident', email: 'resident.demo@kcc.local', displayName: 'Amina Resident (Demo)', role: 'RESIDENT', departmentId: null },
  { id: 'usr_demo_admin', email: 'admin.demo@kcc.local', displayName: 'Farid Admin (Demo)', role: 'ADMIN', departmentId: null },
  { id: 'usr_demo_officer', email: 'officer.demo@kcc.local', displayName: 'Hafiz Officer (Demo)', role: 'OFFICER', departmentId: 'dept_public_works' },
];

const passwordHash = hashPasswordNode(process.env.KCC_DEMO_PASSWORD || 'DemoPass123!');
const sql = demoUsers
  .map((u) => {
    const dept = u.departmentId ? `'${u.departmentId}'` : 'NULL';
    return `INSERT INTO users (id, email, display_name, password_hash, role, department_id, is_active, created_at, updated_at) VALUES ('${u.id}', '${u.email}', '${u.displayName}', '${passwordHash}', '${u.role}', ${dept}, 1, '${now}', '${now}') ON CONFLICT(id) DO UPDATE SET password_hash = '${passwordHash}', email = '${u.email}';`;
  })
  .join('\n');

const tmpFile = path.join(os.tmpdir(), 'kcc-seed-demo.sql');
fs.writeFileSync(tmpFile, sql, 'utf8');
try {
  console.log('Seeding local D1 demo accounts...');
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'kedah-community-connect-db', '--local', '--file', tmpFile], {
    stdio: 'inherit',
    shell: true,
  });
  console.log('Demo accounts seeded for local development.');
} finally {
  fs.unlinkSync(tmpFile);
}
