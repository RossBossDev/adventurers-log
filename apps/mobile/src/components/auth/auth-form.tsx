import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform, TextInput, View } from "react-native";

import { route } from "../../lib/routes";
import { useAuthSessionStore } from "../../store/auth-session.store";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Text } from "../ui/text";

const RESEND_SECONDS = 60;

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailStep, setEmailStep] = useState<"email" | "otp">("email");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(
    null,
  );
  const [now, setNow] = useState(Date.now());
  const isWorking = useAuthSessionStore((state) => state.isWorking);
  const statusMessage = useAuthSessionStore((state) => state.statusMessage);
  const signInWithApple = useAuthSessionStore((state) => state.signInWithApple);
  const signInWithGoogle = useAuthSessionStore(
    (state) => state.signInWithGoogle,
  );
  const sendEmailOtp = useAuthSessionStore((state) => state.sendEmailOtp);
  const signInWithEmailOtp = useAuthSessionStore(
    (state) => state.signInWithEmailOtp,
  );
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const resendSecondsRemaining = useMemo(() => {
    if (!resendAvailableAt) {
      return 0;
    }

    return Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
  }, [now, resendAvailableAt]);

  useEffect(() => {
    if (!resendAvailableAt || resendSecondsRemaining <= 0) {
      return;
    }

    const interval = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(interval);
  }, [resendAvailableAt, resendSecondsRemaining]);

  const runAuthAction = async (action: () => Promise<void>) => {
    setErrorMessage(null);

    try {
      await action();
      router.replace(route("/you"));
    } catch (error) {
      setErrorMessage(readErrorMessage(error));
    }
  };

  const handleSendCode = async () => {
    setErrorMessage(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("Enter your email address.");
      return;
    }

    try {
      await sendEmailOtp(normalizedEmail);
      setEmail(normalizedEmail);
      setOtp("");
      setEmailStep("otp");
      setResendAvailableAt(Date.now() + RESEND_SECONDS * 1000);
      setNow(Date.now());
    } catch (error) {
      setErrorMessage(readErrorMessage(error));
    }
  };

  const handleVerifyCode = async () => {
    const normalizedOtp = otp.trim();

    if (normalizedOtp.length !== 6) {
      setErrorMessage("Enter the 6-digit code from your email.");
      return;
    }

    await runAuthAction(() => signInWithEmailOtp(email, normalizedOtp));
  };

  return (
    <View className="gap-4">
      <Card className="gap-4">
        <Text variant="title">Continue to Adventurers&apos; Log</Text>
        <Text variant="body">
          Continue with Apple, Google, or a one-time email code. First sign-in
          creates your Adventurers&apos; Log user automatically.
        </Text>

        <View className="gap-3">
          <Button
            disabled={isWorking || Platform.OS !== "ios"}
            onPress={() => runAuthAction(signInWithApple)}
          >
            Continue with Apple
          </Button>
          {Platform.OS !== "ios" ? (
            <Text variant="muted">Apple sign-in is available on iOS only.</Text>
          ) : null}

          <Button
            disabled={isWorking || !googleClientId}
            onPress={() => runAuthAction(signInWithGoogle)}
            variant="outline"
          >
            Continue with Google
          </Button>
          {!googleClientId ? (
            <Text variant="muted">
              Google sign-in needs EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.
            </Text>
          ) : null}
        </View>
      </Card>

      <Card className="gap-4" variant="parchment">
        <Text variant="title">Continue with email</Text>
        {emailStep === "email" ? (
          <View className="gap-3">
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              className="rounded-al-md border border-al-moss bg-al-cream px-4 py-3 text-base text-al-ink"
              inputMode="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              textContentType="emailAddress"
              value={email}
            />
            <Button disabled={isWorking} onPress={handleSendCode}>
              Email me a code
            </Button>
          </View>
        ) : (
          <View className="gap-3">
            <Text variant="body">Enter the 6-digit code sent to {email}.</Text>
            <TextInput
              autoComplete="one-time-code"
              className="rounded-al-md border border-al-moss bg-al-cream px-4 py-3 text-base text-al-ink"
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={setOtp}
              placeholder="123456"
              textContentType="oneTimeCode"
              value={otp}
            />
            <Button disabled={isWorking} onPress={handleVerifyCode}>
              Verify code
            </Button>
            <Button
              disabled={isWorking || resendSecondsRemaining > 0}
              onPress={handleSendCode}
              variant="outline"
            >
              {resendSecondsRemaining > 0
                ? `Resend in ${resendSecondsRemaining}s`
                : "Resend code"}
            </Button>
            <Button
              disabled={isWorking}
              onPress={() => {
                setEmailStep("email");
                setOtp("");
                setResendAvailableAt(null);
              }}
              variant="ghost"
            >
              Change email
            </Button>
          </View>
        )}
      </Card>

      {errorMessage || statusMessage ? (
        <Card className="gap-2" variant="cream">
          {errorMessage ? <Text variant="error">{errorMessage}</Text> : null}
          {statusMessage ? <Text variant="muted">{statusMessage}</Text> : null}
        </Card>
      ) : null}
    </View>
  );
}

function readErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}
