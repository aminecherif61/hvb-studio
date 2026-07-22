import nodemailer from "nodemailer";
import { env } from "./env";

/**
 * Password-reset mail. With no SMTP configured (local dev) the link is
 * printed to the server console so the flow stays fully testable.
 */
export async function sendPasswordResetMail(to: string, resetUrl: string): Promise<void> {
  if (!env.SMTP_HOST) {
    console.log(
      JSON.stringify({ level: "info", scope: "vault.mail", msg: "SMTP not configured — reset link follows", to, resetUrl }),
    );
    return;
  }
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({
    from: env.MAIL_FROM,
    to,
    subject: "HVB Vault — password reset",
    text: `A password reset was requested for your HVB Vault account.\n\nReset link (valid 15 minutes, single use):\n${resetUrl}\n\nIf you did not request this, ignore this email — your password is unchanged.`,
  });
}
