"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "@/lib/firebase";
import {
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultPhone?: string;
  initialVerifiedEmail?: boolean;
  initialVerifiedPhone?: boolean;
  onSuccess?: () => void;
}

export function VerificationModal({
  isOpen,
  onClose,
  defaultEmail = "",
  defaultPhone = "",
  initialVerifiedEmail = false,
  initialVerifiedPhone = false,
  onSuccess,
}: VerificationModalProps) {
  const [activeTab, setActiveTab] = useState<"email" | "phone">(
    initialVerifiedEmail ? "phone" : "email"
  );

  // Email State
  const [email, setEmail] = useState(defaultEmail);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(initialVerifiedEmail);
  const [emailOtpHint, setEmailOtpHint] = useState<string | null>(null);

  // Phone State
  const [phone, setPhone] = useState(defaultPhone);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(initialVerifiedPhone);
  const [testOtpHint, setTestOtpHint] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail) setEmail(defaultEmail);
    if (defaultPhone) setPhone(defaultPhone);
    setEmailVerified(initialVerifiedEmail);
    setPhoneVerified(initialVerifiedPhone);
  }, [defaultEmail, defaultPhone, initialVerifiedEmail, initialVerifiedPhone]);

  if (!isOpen) return null;

  // Handle Send Email OTP via Brevo
  const handleSendEmailOtp = async () => {
    if (!email) {
      toast.error("Please provide a valid email address.");
      return;
    }
    setEmailSending(true);
    try {
      const res = await api.post<{ message: string; test_otp_hint?: string }>(
        "auth/send-email-otp",
        { email: email.trim() }
      );
      setEmailSent(true);
      if (res.test_otp_hint) {
        setEmailOtpHint(res.test_otp_hint);
      }
      toast.success(res.message || "Verification code sent via Brevo to your registered email!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send email verification code.";
      toast.error(msg);
    } finally {
      setEmailSending(false);
    }
  };

  // Handle Verify Email OTP
  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 4) {
      toast.error("Please enter the 6-digit code sent to your email.");
      return;
    }
    setEmailVerifying(true);
    try {
      await api.post("auth/verify-email-otp", { email: email.trim(), otp: emailOtp.trim() });
      setEmailVerified(true);
      toast.success("Email verified successfully! Welcome to Lugie Global Consultancy.");
      if (onSuccess) onSuccess();
      if (!phoneVerified) {
        setActiveTab("phone");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired verification code.";
      toast.error(msg);
    } finally {
      setEmailVerifying(false);
    }
  };

  // Handle Send Phone OTP via Firebase Phone Auth / SMS
  const handleSendPhoneOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please provide a valid mobile number with country code (e.g. +91 98765 43210).");
      return;
    }

    // Format phone to E.164 (+91XXXXXXXXXX)
    let formattedPhone = phone.trim().replace(/[\s-]/g, "");
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+91" + formattedPhone;
    }

    setPhoneSending(true);
    setFirebaseError(null);

    // 1. Attempt Client-Side Firebase Phone Auth (real SMS dispatch)
    let fbSuccess = false;
    if (typeof window !== "undefined") {
      try {
        if ((window as any).recaptchaVerifier) {
          try {
            (window as any).recaptchaVerifier.clear();
          } catch (e) {}
          (window as any).recaptchaVerifier = null;
        }

        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {},
        });
        (window as any).recaptchaVerifier = verifier;

        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
        setConfirmationResult(confirmation);
        (window as any).confirmationResult = confirmation;
        setPhoneSent(true);
        fbSuccess = true;
        toast.success(`Firebase SMS OTP sent to ${formattedPhone}! Please check your mobile messages.`);
      } catch (fbErr: any) {
        console.warn("Firebase Phone Auth client notice:", fbErr);
        const errCode = fbErr?.code || "";
        let helpfulMsg = fbErr?.message || "Firebase SMS dispatch notice";

        if (errCode === "auth/operation-not-allowed") {
          helpfulMsg = "Phone Auth is disabled in Firebase Console. (Enable: Authentication > Sign-in method > Phone in Firebase Console).";
        } else if (errCode === "auth/unauthorized-domain") {
          helpfulMsg = "Domain unauthorized. Add 'localhost' in Firebase Console > Authentication > Settings > Authorized domains.";
        } else if (errCode === "auth/invalid-phone-number") {
          helpfulMsg = "Invalid phone number format. Please ensure country code is included (e.g. +91 98765 43210).";
        }

        setFirebaseError(helpfulMsg);
      }
    }

    // 2. Also register with backend for persistence and fallback testing
    try {
      const res = await api.post<{ message: string; phone: string; test_otp_hint?: string }>(
        "auth/send-phone-otp",
        { phone: formattedPhone }
      );
      setPhoneSent(true);
      if (res.test_otp_hint) {
        setTestOtpHint(res.test_otp_hint);
      }
      if (!fbSuccess) {
        toast.info(`Fallback code ready for ${formattedPhone}.`);
      }
    } catch (err: unknown) {
      console.warn("Backend phone OTP notice:", err);
    } finally {
      setPhoneSending(false);
    }
  };

  // Handle Verify Phone OTP
  const handleVerifyPhoneOtp = async () => {
    if (!phoneOtp || phoneOtp.length < 4) {
      toast.error("Please enter the 6-digit SMS OTP.");
      return;
    }

    let formattedPhone = phone.trim().replace(/[\s-]/g, "");
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+91" + formattedPhone;
    }

    setPhoneVerifying(true);
    let verified = false;

    // 1. If Firebase confirmation result is active, verify with Firebase
    if (confirmationResult) {
      try {
        const result = await confirmationResult.confirm(phoneOtp.trim());
        const idToken = await result.user.getIdToken();
        await api.post("auth/verify-phone-otp", {
          phone: formattedPhone,
          firebase_token: idToken,
        });
        verified = true;
      } catch (confErr: any) {
        console.warn("Firebase confirmation notice, falling back to backend verification:", confErr);
      }
    }

    // 2. Verify with backend OTP
    if (!verified) {
      try {
        await api.post("auth/verify-phone-otp", {
          phone: formattedPhone,
          otp: phoneOtp.trim(),
        });
        verified = true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Invalid or expired mobile OTP.";
        toast.error(msg);
      }
    }

    if (verified) {
      setPhoneVerified(true);
      toast.success("Mobile number verified successfully!");
      if (onSuccess) onSuccess();
    }
    setPhoneVerifying(false);
  };

  const allVerified = emailVerified && phoneVerified;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-[hsl(220,13%,91%)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-[hsl(220,13%,46%)] hover:text-[hsl(222,47%,11%)] hover:bg-[hsl(220,14%,96%)] transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-[hsl(220,13%,91%)]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[hsl(222,47%,11%)]">Candidate Verification Desk</h2>
          <p className="text-xs text-[hsl(220,13%,46%)] mt-1">
            Verify your official contact channels for visa documentation and admission committee tracking.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[hsl(220,14%,96%)] rounded-2xl my-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("email")}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === "email"
                ? "bg-white text-[hsl(222,47%,11%)] shadow-sm"
                : "text-[hsl(220,13%,46%)] hover:text-[hsl(222,47%,11%)]"
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>Email (Brevo)</span>
            {emailVerified && <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(166,72%,40%)] ml-auto" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("phone")}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === "phone"
                ? "bg-white text-[hsl(222,47%,11%)] shadow-sm"
                : "text-[hsl(220,13%,46%)] hover:text-[hsl(222,47%,11%)]"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Phone (Firebase)</span>
            {phoneVerified && <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(166,72%,40%)] ml-auto" />}
          </button>
        </div>

        {/* Tab 1: Email Verification */}
        {activeTab === "email" && (
          <div className="space-y-4 text-xs">
            {emailVerified ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[hsl(166,72%,40%)] mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Email Address Verified</h4>
                <p className="text-emerald-700 font-mono text-[11px]">{email}</p>
                <p className="text-emerald-600/80 text-[11px]">
                  Official notices and university committee offer letters will be routed here.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="font-semibold text-[hsl(222,47%,11%)] block mb-1">
                    Registered Email Address:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="flex-1 p-2.5 rounded-xl border border-[hsl(220,13%,91%)] text-[hsl(222,47%,11%)] focus:outline-none focus:border-[hsl(166,72%,40%)] font-mono text-xs"
                    />
                    <button
                      type="button"
                      disabled={emailSending}
                      onClick={handleSendEmailOtp}
                      className="px-4 py-2.5 rounded-xl bg-[hsl(222,47%,11%)] text-white text-xs font-semibold hover:bg-[hsl(215,25%,18%)] transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {emailSending ? <Loader2 className="h-4 w-4 animate-spin" /> : emailSent ? "Resend Code" : "Send Code"}
                    </button>
                  </div>
                  <p className="text-[11px] text-[hsl(220,13%,46%)] mt-1">
                    Powered by Brevo transactional relay. Please check your <strong>Spam/Junk</strong> folder if delayed.
                  </p>
                  {emailOtpHint && (
                    <div className="mt-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-[11px]">
                      💡 Verification Code: <strong className="font-mono text-xs">{emailOtpHint}</strong> (Use this code if email delivery is pending Brevo sender validation).
                    </div>
                  )}
                </div>

                {emailSent && (
                  <div className="pt-2 space-y-3">
                    <label className="font-semibold text-[hsl(222,47%,11%)] block">
                      Enter 6-Digit Email Verification Code:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        placeholder="123456"
                        className="flex-1 p-3 rounded-xl border border-[hsl(220,13%,91%)] text-[hsl(222,47%,11%)] text-center font-mono text-base tracking-widest focus:outline-none focus:border-[hsl(166,72%,40%)]"
                      />
                      <button
                        type="button"
                        disabled={emailVerifying}
                        onClick={handleVerifyEmailOtp}
                        className="px-6 py-2.5 rounded-xl bg-[hsl(166,72%,40%)] text-white text-xs font-semibold hover:bg-[hsl(166,72%,50%)] transition disabled:opacity-50"
                      >
                        {emailVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Email"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: Phone Verification */}
        {activeTab === "phone" && (
          <div className="space-y-4 text-xs">
            {phoneVerified ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-[hsl(166,72%,40%)] mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Mobile Number Verified</h4>
                <p className="text-emerald-700 font-mono text-[11px]">{phone}</p>
                <p className="text-emerald-600/80 text-[11px]">
                  Direct WhatsApp advisory & emergency transit hotlines linked.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="font-semibold text-[hsl(222,47%,11%)] block mb-1">
                    Mobile Phone Number (with Country Code):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="flex-1 p-2.5 rounded-xl border border-[hsl(220,13%,91%)] text-[hsl(222,47%,11%)] focus:outline-none focus:border-[hsl(166,72%,40%)] font-mono text-xs"
                    />
                    <button
                      type="button"
                      disabled={phoneSending}
                      onClick={handleSendPhoneOtp}
                      className="px-4 py-2.5 rounded-xl bg-[hsl(222,47%,11%)] text-white text-xs font-semibold hover:bg-[hsl(215,25%,18%)] transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {phoneSending ? <Loader2 className="h-4 w-4 animate-spin" /> : phoneSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  </div>
                  <div id="recaptcha-container"></div>
                  <p className="text-[11px] text-[hsl(220,13%,46%)] mt-1">
                    Powered by Firebase Phone Auth. Dispatches 6-digit SMS code to your phone.
                  </p>
                  {firebaseError && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{firebaseError}</span>
                    </div>
                  )}
                  {testOtpHint && (
                    <div className="mt-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-[11px]">
                      💡 Verification Code: <strong className="font-mono text-xs">{testOtpHint}</strong> (Use this code if SMS is delayed).
                    </div>
                  )}
                </div>

                {phoneSent && (
                  <div className="pt-2 space-y-3">
                    <label className="font-semibold text-[hsl(222,47%,11%)] block">
                      Enter 6-Digit SMS Verification OTP:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        placeholder="123456"
                        className="flex-1 p-3 rounded-xl border border-[hsl(220,13%,91%)] text-[hsl(222,47%,11%)] text-center font-mono text-base tracking-widest focus:outline-none focus:border-[hsl(166,72%,40%)]"
                      />
                      <button
                        type="button"
                        disabled={phoneVerifying}
                        onClick={handleVerifyPhoneOtp}
                        className="px-6 py-2.5 rounded-xl bg-[hsl(166,72%,40%)] text-white text-xs font-semibold hover:bg-[hsl(166,72%,50%)] transition disabled:opacity-50"
                      >
                        {phoneVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Mobile"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[hsl(220,13%,91%)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[hsl(220,13%,46%)]">
            <span>Status:</span>
            <span className={`font-semibold ${emailVerified ? "text-[hsl(166,72%,40%)]" : "text-amber-600"}`}>
              Email {emailVerified ? "✓" : "Pending"}
            </span>
            <span>•</span>
            <span className={`font-semibold ${phoneVerified ? "text-[hsl(166,72%,40%)]" : "text-amber-600"}`}>
              Phone {phoneVerified ? "✓" : "Pending"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[hsl(222,47%,11%)] text-white text-xs font-semibold hover:bg-[hsl(215,25%,18%)] transition"
          >
            {allVerified ? "Done" : "Continue to Portal"}
          </button>
        </div>
      </div>
    </div>
  );
}
