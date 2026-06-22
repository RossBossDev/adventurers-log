import type { ConfigService } from "@nestjs/config";
import {
  type Auth,
  type BetterAuthPlugin,
  betterAuth,
  type SocialProviders,
} from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { importPKCS8, SignJWT } from "jose";
import type { Pool } from "pg";
import type { AppConfig } from "../config/app.config";
import { sendAuthOtpEmail } from "./auth-email.sender";

async function generateAppleClientSecret(
  appIdentifier: string,
  teamId: string,
  keyId: string,
  privateKey: string,
) {
  const key = await importPKCS8(privateKey, "ES256");
  const now = Math.floor(Date.now() / 1000);
  const sixMonthsInSeconds = 180 * 24 * 60 * 60;

  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setSubject(appIdentifier)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt(now)
    .setExpirationTime(now + sixMonthsInSeconds)
    .sign(key);
}

export async function createAuthInstance(
  config: ConfigService<AppConfig, true>,
  pool: Pool,
): Promise<Auth> {
  const googleClientId = optional(
    config.get("GOOGLE_CLIENT_ID", { infer: true }),
  );
  const googleClientSecret = optional(
    config.get("GOOGLE_CLIENT_SECRET", { infer: true }),
  );
  const googleIOSClientId = optional(
    config.get("GOOGLE_IOS_CLIENT_ID", { infer: true }),
  );
  const appleTeamId = optional(config.get("APPLE_TEAM_ID", { infer: true }));
  const appleKeyId = optional(config.get("APPLE_KEY_ID", { infer: true }));
  const appleClientId = optional(
    config.get("APPLE_CLIENT_ID", { infer: true }),
  );
  const applePrivateKeyBase64 = optional(
    config.get("APPLE_PRIVATE_KEY_BASE64", { infer: true }),
  );
  const appleAppBundleIdentifier = optional(
    config.get("APPLE_APP_BUNDLE_IDENTIFIER", { infer: true }),
  );
  const socialProviders: SocialProviders = {};
  const googleClientIds = [googleClientId, googleIOSClientId].filter(
    (clientId): clientId is string => Boolean(clientId),
  );

  if (googleClientIds.length > 0 && googleClientSecret) {
    socialProviders.google = {
      clientId: googleClientIds,
      clientSecret: googleClientSecret,
    };
  }

  if (
    appleClientId &&
    appleTeamId &&
    appleKeyId &&
    applePrivateKeyBase64 &&
    appleAppBundleIdentifier
  ) {
    const applePrivateKey = Buffer.from(
      applePrivateKeyBase64,
      "base64",
    ).toString("utf8");
    const appleClientSecret = await generateAppleClientSecret(
      appleClientId,
      appleTeamId,
      appleKeyId,
      applePrivateKey,
    );

    socialProviders.apple = {
      clientId: appleClientId,
      clientSecret: appleClientSecret,
      appBundleIdentifier: appleAppBundleIdentifier,
    };
  }

  return betterAuth({
    database: pool,
    secret: config.get("BETTER_AUTH_SECRET", { infer: true }),
    baseURL: config.get("BETTER_AUTH_URL", { infer: true }),
    trustedOrigins: parseTrustedOrigins(
      config.get("BETTER_AUTH_TRUSTED_ORIGINS", { infer: true }),
    ),
    socialProviders,
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 5 * 60,
        sendVerificationOTP: async ({ email, otp, type }) => {
          await sendAuthOtpEmail(config, { email, otp, type });
        },
      }),
    ] as unknown as BetterAuthPlugin[],
  }) as Auth;
}

function parseTrustedOrigins(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((origin) => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean),
    ),
  );
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
