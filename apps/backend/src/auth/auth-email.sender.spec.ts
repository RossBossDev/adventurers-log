import type { ConfigService } from "@nestjs/config";
import type { AppConfig } from "../config/app.config";
import { sendAuthOtpEmail } from "./auth-email.sender";

function config(values: Partial<AppConfig>) {
  return {
    get: (key: keyof AppConfig) => values[key],
  } as ConfigService<AppConfig, true>;
}

describe("sendAuthOtpEmail", () => {
  it("logs the OTP in development when Resend is not configured", async () => {
    const logger = { log: jest.fn(), error: jest.fn() };

    await sendAuthOtpEmail(
      config({
        NODE_ENV: "development",
        AUTH_EMAIL_FROM: "Adventurers' Log <auth@rossboss.dev>",
      }),
      { email: "player@example.com", otp: "123456", type: "sign-in" },
      { logger },
    );

    expect(logger.log).toHaveBeenCalledWith(
      "Auth OTP type=sign-in email=player@example.com otp=123456",
    );
  });

  it("skips sending in test", async () => {
    const logger = { log: jest.fn(), error: jest.fn() };
    const resendFactory = jest.fn();

    await sendAuthOtpEmail(
      config({
        NODE_ENV: "test",
        RESEND_API_KEY: "test-key",
        AUTH_EMAIL_FROM: "Adventurers' Log <auth@rossboss.dev>",
      }),
      { email: "player@example.com", otp: "123456", type: "sign-in" },
      { logger, resendFactory },
    );

    expect(resendFactory).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith(
      "Skipping auth OTP email in test for player@example.com",
    );
  });

  it("throws in production when Resend is not configured", async () => {
    await expect(
      sendAuthOtpEmail(
        config({
          NODE_ENV: "production",
          AUTH_EMAIL_FROM: "Adventurers' Log <auth@rossboss.dev>",
        }),
        { email: "player@example.com", otp: "123456", type: "sign-in" },
        { logger: { log: jest.fn(), error: jest.fn() } },
      ),
    ).rejects.toThrow(
      "RESEND_API_KEY is required to send Adventurers' Log auth OTP emails in production.",
    );
  });

  it("sends with Resend when configured", async () => {
    const send = jest.fn().mockResolvedValue({
      data: { id: "email_123" },
      error: null,
    });
    const logger = { log: jest.fn(), error: jest.fn() };

    await sendAuthOtpEmail(
      config({
        NODE_ENV: "development",
        RESEND_API_KEY: "resend-key",
        AUTH_EMAIL_FROM: "Adventurers' Log <auth@rossboss.dev>",
      }),
      { email: "player@example.com", otp: "123456", type: "sign-in" },
      { logger, resendFactory: () => ({ emails: { send } }) },
    );

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Adventurers' Log <auth@rossboss.dev>",
        to: "player@example.com",
        subject: "Your Adventurers' Log sign-in code",
        text: "Your Adventurers' Log sign-in code is 123456. It expires in 5 minutes.",
      }),
    );
    expect(logger.log).toHaveBeenCalledWith(
      "Sent auth OTP email to player@example.com via Resend id=email_123",
    );
  });

  it("throws useful errors when Resend fails", async () => {
    const send = jest.fn().mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "bad sender" },
    });
    const logger = { log: jest.fn(), error: jest.fn() };

    await expect(
      sendAuthOtpEmail(
        config({
          NODE_ENV: "development",
          RESEND_API_KEY: "resend-key",
          AUTH_EMAIL_FROM: "Adventurers' Log <auth@rossboss.dev>",
        }),
        { email: "player@example.com", otp: "123456", type: "sign-in" },
        { logger, resendFactory: () => ({ emails: { send } }) },
      ),
    ).rejects.toThrow(
      "Resend failed to send Adventurers' Log auth OTP email to player@example.com: validation_error bad sender",
    );
  });
});
