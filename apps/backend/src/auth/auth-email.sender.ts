import { Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import type { AppConfig } from "../config/app.config";

export type AuthOtpMessage = {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
};

type ResendClient = Pick<Resend, "emails">;

type AuthEmailSenderDeps = {
  logger?: Pick<Logger, "log" | "error">;
  resendFactory?: (apiKey: string) => ResendClient;
};

const defaultLogger = new Logger("BetterAuthEmail");

export async function sendAuthOtpEmail(
  config: ConfigService<AppConfig, true>,
  message: AuthOtpMessage,
  deps: AuthEmailSenderDeps = {},
) {
  const logger = deps.logger ?? defaultLogger;
  const nodeEnv = config.get("NODE_ENV", { infer: true });
  const apiKey = optional(config.get("RESEND_API_KEY", { infer: true }));
  const from = config.get("AUTH_EMAIL_FROM", { infer: true });

  if (nodeEnv === "test") {
    logger.log(`Skipping auth OTP email in test for ${message.email}`);
    return;
  }

  if (!apiKey) {
    if (nodeEnv === "production") {
      throw new Error(
        "RESEND_API_KEY is required to send Adventurers' Log auth OTP emails in production.",
      );
    }

    logger.log(
      `Auth OTP type=${message.type} email=${message.email} otp=${message.otp}`,
    );
    return;
  }

  const resend = deps.resendFactory?.(apiKey) ?? new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: message.email,
    subject: "Your Adventurers' Log sign-in code",
    html: renderOtpHtml(message.otp),
    text: renderOtpText(message.otp),
  });

  if (result.error) {
    const errorMessage = `Resend failed to send Adventurers' Log auth OTP email to ${message.email}: ${result.error.name} ${result.error.message}`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  logger.log(
    `Sent auth OTP email to ${message.email} via Resend id=${result.data?.id ?? "unknown"}`,
  );
}

function renderOtpHtml(otp: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; color: #1f2937;">
    <h1>Your Adventurers' Log sign-in code</h1>
    <p>Use this code to finish signing in:</p>
    <p style="font-size: 28px; font-weight: 700; letter-spacing: 0.2em;">${escapeHtml(otp)}</p>
    <p>This code expires in 5 minutes.</p>
  </body>
</html>`;
}

function renderOtpText(otp: string): string {
  return `Your Adventurers' Log sign-in code is ${otp}. It expires in 5 minutes.`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
