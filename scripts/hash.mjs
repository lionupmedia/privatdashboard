import bcrypt from "bcryptjs";
const pw = process.argv[2];
if (!pw) { console.error("Aufruf: node scripts/hash.mjs <passwort>"); process.exit(1); }
console.log(bcrypt.hashSync(pw, 12));
