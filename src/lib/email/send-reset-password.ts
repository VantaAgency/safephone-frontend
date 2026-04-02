import "server-only";

import { Resend } from "resend";
import { getSiteURL } from "@/lib/site-url";

let resendClient: Resend | null = null;

function getRequiredEnv(name: "RESEND_API_KEY" | "RESEND_FROM_EMAIL") {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required to send password reset emails`);
  }
  return value;
}

function getResendClient() {
  if (!resendClient) {
    resendClient = new Resend(getRequiredEnv("RESEND_API_KEY"));
  }

  return resendClient;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendResetPasswordEmail({
  to,
  resetURL,
}: {
  to: string;
  resetURL: string;
}) {
  const siteURL = getSiteURL();
  const escapedResetURL = escapeHtml(resetURL);

  await getResendClient().emails.send({
    from: getRequiredEnv("RESEND_FROM_EMAIL"),
    to,
    subject:
      "SafePhone - Reinitialisez votre mot de passe / Reset your password",
    text: [
      "Bonjour,",
      "",
      "Nous avons recu une demande de reinitialisation de mot de passe pour votre compte SafePhone.",
      `Ouvrez ce lien pour choisir un nouveau mot de passe: ${resetURL}`,
      "",
      "Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.",
      "",
      "Hello,",
      "",
      "We received a password reset request for your SafePhone account.",
      `Open this link to choose a new password: ${resetURL}`,
      "",
      "If you did not request this reset, you can safely ignore this email.",
      "",
      `SafePhone - ${siteURL}`,
    ].join("\n"),
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #1e1b4b; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 24px;">
        <p style="font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin: 0 0 16px;">
          SafePhone
        </p>
        <h1 style="font-size: 24px; margin: 0 0 12px;">Reinitialisez votre mot de passe</h1>
        <p style="margin: 0 0 12px;">
          Nous avons recu une demande de reinitialisation de mot de passe pour votre compte SafePhone.
        </p>
        <p style="margin: 0 0 24px;">
          Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire automatiquement.
        </p>
        <p style="margin: 0 0 32px;">
          <a
            href="${escapedResetURL}"
            style="display: inline-block; background: #facc15; color: #1e1b4b; text-decoration: none; font-weight: 600; padding: 14px 22px; border-radius: 999px;"
          >
            Reinitialiser mon mot de passe
          </a>
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 0 0 24px;" />
        <h2 style="font-size: 20px; margin: 0 0 12px;">Reset your password</h2>
        <p style="margin: 0 0 12px;">
          We received a password reset request for your SafePhone account.
        </p>
        <p style="margin: 0 0 24px;">
          Use the button above to choose a new password. This link expires automatically.
        </p>
        <p style="margin: 0 0 12px; color: #475569; font-size: 14px;">
          If the button does not open, copy and paste this link into your browser:
        </p>
        <p style="margin: 0; word-break: break-all; font-size: 14px;">
          <a href="${escapedResetURL}" style="color: #1d4ed8;">${escapedResetURL}</a>
        </p>
      </div>
    `,
  });
}
