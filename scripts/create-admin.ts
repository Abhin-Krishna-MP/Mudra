/** npm run create-admin -- email@example.org "Display Name" author|reviewer|admin   (password read from env ADMIN_PASSWORD or prompted-less arg 4) */
import { scriptDb } from './db';
import { hashPassword } from '../src/lib/auth';
const [email, name, role = 'reviewer', pwArg] = process.argv.slice(2);
const pw = pwArg || process.env.ADMIN_PASSWORD;
if (!email || !name || !pw || !['author', 'reviewer', 'admin'].includes(role)) {
  console.error('Usage: ADMIN_PASSWORD=... npm run create-admin -- <email> "<name>" [author|reviewer|admin]'); process.exit(1);
}
if (pw.length < 10) { console.error('Password must be at least 10 characters.'); process.exit(1); }
async function main() {
const db = await scriptDb();
await db.execute('DELETE FROM users WHERE email = ?', [email.toLowerCase()]);
await db.execute('INSERT INTO users (email,name,role,password_hash) VALUES (?,?,?,?)', [email.toLowerCase(), name, role, hashPassword(pw!)]);
console.log(`Created ${role} ${email}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
