"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { FeedbackBanner, ModalShell } from "@/components/ui/feedback";
import {
  Mail,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
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

  const handleSendPhoneOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please provide a valid mobile number with country code (e.g. +91 98765 43210).");
      return;
    }

    let formattedPhone = phone.trim().replace(/[\s-]/g, "");
    if (!formattedPhone.startsWith("+")) {
      formattedPhone = "+91" + formattedPhone;
    }

    setPhoneSending(true);
    setFirebaseError(null);

    let fbSuccess = false;
    if (typeof window !== "undefined") {
      try {
        if ((window as unknown as Record<string, unknown>).recaptchaVerifier) {
          try {
            ((window as unknown as Record<string, { clear?: () => void }>).recaptchaVerifier).clear?.();
          } catch {
            // ignore
          }
          (window as unknown as Record<string, unknown>).recaptchaVerifier = null;
        }

        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {},
        });
        (window as unknown as Record<string, unknown>).recaptchaVerifier = verifier;

        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
        setConfirmationResult(confirmation);
        (window as unknown as Record<string, unknown>).confirmationResult = confirmation;
        setPhoneSent(true);
        fbSuccess = true;
        toast.success(`Firebase SMS OTP sent to ${formattedPhone}! Please check your mobile messages.`);
      } catch (fbErr: unknown) {
        console.warn("Firebase Phone Auth client notice:", fbErr);
        const errObj = fbErr as { code?: string; message?: string };
        const errCode = errObj?.code || "";
        let helpfulMsg = errObj?.message || "Firebase SMS dispatch notice";

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

    if (confirmationResult) {
      try {
        const result = await confirmationResult.confirm(phoneOtp.trim());
        const idToken = await result.user.getIdToken();
        await api.post("auth/verify-phone-otp", {
          phone: formattedPhone,
          firebase_token: idToken,
        });
        verified = true;
      } catch (confErr: unknown) {
        console.warn("Firebase confirmation notice, falling back to backend verification:", confErr);
      }
    }

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
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      {/* Header */}
      <div className="text-center pb-4 border-b border-[#DCE5E8]">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258] mb-2">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="font-editorial text-xl text-[#394B49]">Candidate Verification Desk</h2>
        <p className="text-xs text-[#546866] mt-1">
          Verify your official contact channels for visa documentation and admission committee tracking.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F3F0E8] border border-[#DCE5E8] rounded-2xl my-5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === "email"
              ? "bg-white text-[#394B49] shadow-xs border border-[#DCE5E8]"
              : "text-[#546866] hover:text-[#394B49]"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          <span>Email (Brevo)</span>
          {emailVerified && <CheckCircle2 className="h-3.5 w-3.5 text-[#2F6B55] ml-auto" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("phone")}
          className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === "phone"
              ? "bg-white text-[#394B49] shadow-xs border border-[#DCE5E8]"
              : "text-[#546866] hover:text-[#394B49]"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Phone (Firebase)</span>
          {phoneVerified && <CheckCircle2 className="h-3.5 w-3.5 text-[#2F6B55] ml-auto" />}
        </button>
      </div>

      {/* Tab 1: Email Verification */}
      {activeTab === "email" && (
        <div className="space-y-4 text-xs">
          {emailVerified ? (
            <div className="p-5 rounded-2xl bg-[#EDF5F1] border border-[#B7CBC2] text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-[#2F6B55] mx-auto" />
              <h4 className="font-bold text-[#263331] text-sm">Email Address Verified</h4>
              <p className="text-[#2F6B55] font-mono text-[11px]">{email}</p>
              <p className="text-[#3F6258] text-[11px]">
                Official notices and university committee offer letters will be routed here.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="font-semibold text-[#394B49] block mb-1.5">
                  Registered Email Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="flex-1 p-2.5 rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 text-[#394B49] focus:outline-none focus:border-[#394B49] focus:bg-white font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={emailSending}
                    onClick={handleSendEmailOtp}
                  >
                    {emailSent ? "Resend Code" : "Send Code"}
                  </Button>
                </div>
                <p className="text-[11px] text-[#546866] mt-1.5">
                  Powered by Brevo transactional relay. Please check your <strong>Spam/Junk</strong> folder if delayed.
                </p>
                {emailOtpHint && (
                  <div className="mt-2">
                    <FeedbackBanner
                      tone="info"
                      message={`Verification Code: ${emailOtpHint} (Use this code if email delivery is pending Brevo sender validation).`}
                    />
                  </div>
                )}
              </div>

              {emailSent && (
                <div className="pt-2 space-y-3">
                  <label className="font-semibold text-[#394B49] block">
                    Enter 6-Digit Email Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="123456"
                      className="flex-1 p-3 rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 text-[#394B49] text-center font-mono text-base tracking-widest focus:outline-none focus:border-[#394B49] focus:bg-white"
                    />
                    <Button
                      type="button"
                      variant="warm"
                      size="md"
                      loading={emailVerifying}
                      onClick={handleVerifyEmailOtp}
                    >
                      Verify Email
                    </Button>
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
            <div className="p-5 rounded-2xl bg-[#EDF5F1] border border-[#B7CBC2] text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-[#2F6B55] mx-auto" />
              <h4 className="font-bold text-[#263331] text-sm">Mobile Number Verified</h4>
              <p className="text-[#2F6B55] font-mono text-[11px]">{phone}</p>
              <p className="text-[#3F6258] text-[11px]">
                Direct WhatsApp advisory & emergency transit hotlines linked.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="font-semibold text-[#394B49] block mb-1.5">
                  Mobile Phone Number (with Country Code)
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="flex-1 p-2.5 rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 text-[#394B49] focus:outline-none focus:border-[#394B49] focus:bg-white font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    loading={phoneSending}
                    onClick={handleSendPhoneOtp}
                  >
                    {phoneSent ? "Resend OTP" : "Send OTP"}
                  </Button>
                </div>
                <div id="recaptcha-container"></div>
                <p className="text-[11px] text-[#546866] mt-1.5">
                  Powered by Firebase Phone Auth. Dispatches 6-digit SMS code to your phone.
                </p>
                {firebaseError && (
                  <div className="mt-2">
                    <FeedbackBanner tone="warning" message={firebaseError} />
                  </div>
                )}
                {testOtpHint && (
                  <div className="mt-2">
                    <FeedbackBanner
                      tone="info"
                      message={`Verification Code: ${testOtpHint} (Use this code if SMS is delayed).`}
                    />
                  </div>
                )}
              </div>

              {phoneSent && (
                <div className="pt-2 space-y-3">
                  <label className="font-semibold text-[#394B49] block">
                    Enter 6-Digit SMS Verification OTP
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                      placeholder="123456"
                      className="flex-1 p-3 rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 text-[#394B49] text-center font-mono text-base tracking-widest focus:outline-none focus:border-[#394B49] focus:bg-white"
                    />
                    <Button
                      type="button"
                      variant="warm"
                      size="md"
                      loading={phoneVerifying}
                      onClick={handleVerifyPhoneOtp}
                    >
                      Verify Mobile
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-[#DCE5E8] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-[#546866]">
          <span>Status:</span>
          <span className={`font-semibold ${emailVerified ? "text-[#2F6B55]" : "text-[#8A5A1E]"}`}>
            Email {emailVerified ? "Verified" : "Pending"}
          </span>
          <span>•</span>
          <span className={`font-semibold ${phoneVerified ? "text-[#2F6B55]" : "text-[#8A5A1E]"}`}>
            Phone {phoneVerified ? "Verified" : "Pending"}
          </span>
        </div>

        <Button type="button" variant="primary" size="sm" onClick={onClose}>
          {allVerified ? "Done" : "Continue to Portal"}
        </Button>
      </div>
    </ModalShell>
  );
}
