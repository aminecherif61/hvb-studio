// Creates (or resets the password of) the first admin from ADMIN_EMAIL +
// ADMIN_INITIAL_PASSWORD. Run: npm run vault:seed
// The initial password must already satisfy the production policy.
import { PrismaClient } from "@prisma/client";
import { argon2id } from "hash-wasm";
import { randomBytes } from "node:crypto";

const db = new PrismaClient();

const hash = (password: string) =>
  argon2id({ password, salt: randomBytes(16), parallelism: 1, iterations: 2, memorySize: 19456, hashLength: 32, outputType: "encoded" });

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in .env");

  // The seed honours whatever initial password the owner sets, but warns when
  // it is below the policy enforced on in-app password changes. Change it to a
  // policy-compliant one from Admin → Security after first login.
  const meetsPolicy =
    password.length >= 14 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
  if (!meetsPolicy) {
    console.warn(
      "⚠ ADMIN_INITIAL_PASSWORD is below the recommended policy (14+ chars, upper, lower, number, special). " +
        "Brute-force lockout still applies, but change it after first login.",
    );
  }

  const passwordHash = await hash(password);
  const user = await db.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, role: "admin" },
    update: { passwordHash, failedCount: 0, lockedUntil: null },
  });
  console.log(`✔ Admin ready: ${user.email} (change the password after first login, then enable 2FA)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
