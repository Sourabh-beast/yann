"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const RESEND_INTERVAL = 60;

// Helper function to detect input type
const detectInputType = (input) => {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Check for email
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
  if (emailRegex.test(trimmed.toLowerCase())) {
    return 'email';
  }
  
  // Check for phone (10 digits starting with 6-9 for Indian numbers)
  const cleaned = trimmed.replace(/\D/g, '');
  const phoneRegex = /^(91)?[6-9]\d{9}$/;
  if (phoneRegex.test(cleaned)) {
    return 'phone';
  }
  
  return null;
};

// Helper to normalize phone number
const normalizePhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.toString().replace(/\D/g, '');
  return cleaned.slice(-10);
};

const partnerInitialState = () => ({
  step: "identifier", // Changed from "email"
  identifier: "", // Email or Phone
  identifierType: null, // 'email' or 'phone'
  otp: "",
  sending: false,
  verifying: false,
  timer: 0,
});

const residentInitialState = () => ({
  step: "identifier", // Changed from "email"
  mode: "login",
  name: "",
  identifier: "", // Email or Phone
  identifierType: null, // 'email' or 'phone'
  phone: "", // Additional phone for signup when using email
  email: "", // Additional email for signup when using phone
  otp: "",
  sending: false,
  verifying: false,
  timer: 0,
});

const formatTimer = (seconds) => {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

export default function LoginModal({ isOpen, onClose, onLoginSuccess, defaultPanel = "partner", intent = "login" }) {
  const router = useRouter();
  const [partnerForm, setPartnerForm] = useState(partnerInitialState);
  const [residentForm, setResidentForm] = useState(() => ({
    ...residentInitialState(),
    mode: intent === "signup" ? "signup" : "login",
  }));
  const [activePanel, setActivePanel] = useState(defaultPanel);

  useEffect(() => {
    if (!isOpen) {
      setPartnerForm(partnerInitialState());
      setResidentForm({
        ...residentInitialState(),
        mode: intent === "signup" ? "signup" : "login",
      });
      setActivePanel(defaultPanel);
    }
  }, [isOpen, defaultPanel, intent]);

  useEffect(() => {
    if (partnerForm.timer <= 0) return;
    const interval = setInterval(() => {
      setPartnerForm((prev) => {
        if (prev.timer <= 1) {
          return { ...prev, timer: 0 };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [partnerForm.timer]);

  useEffect(() => {
    if (residentForm.timer <= 0) return;
    const interval = setInterval(() => {
      setResidentForm((prev) => {
        if (prev.timer <= 1) {
          return { ...prev, timer: 0 };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [residentForm.timer]);

  const closeModal = useCallback(() => {
    setPartnerForm(partnerInitialState());
    setResidentForm(residentInitialState());
    onClose?.();
  }, [onClose]);

  // Handle identifier input change and auto-detect type
  const handlePartnerIdentifierChange = useCallback((value) => {
    const type = detectInputType(value);
    setPartnerForm((prev) => ({ 
      ...prev, 
      identifier: value,
      identifierType: type
    }));
  }, []);

  const handleResidentIdentifierChange = useCallback((value) => {
    const type = detectInputType(value);
    setResidentForm((prev) => ({ 
      ...prev, 
      identifier: value,
      identifierType: type
    }));
  }, []);

  const requestPartnerOtp = useCallback(async () => {
    if (!partnerForm.identifier) {
      alert("Please enter your email or phone number");
      return;
    }
    
    const inputType = detectInputType(partnerForm.identifier);
    if (!inputType) {
      alert("Please enter a valid email or 10-digit phone number");
      return;
    }
    
    setPartnerForm((prev) => ({ ...prev, sending: true }));
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: partnerForm.identifier,
          audience: "provider",
          intent: "login",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Unable to send OTP");
        return;
      }
      alert(data.message || "OTP sent successfully");
      setPartnerForm((prev) => ({
        ...prev,
        step: "otp",
        identifierType: data.identifierType || inputType,
        otp: "",
        timer: RESEND_INTERVAL,
      }));
      setActivePanel("partner");
    } catch (error) {
      alert("Network error. Please try again");
    } finally {
      setPartnerForm((prev) => ({ ...prev, sending: false }));
    }
  }, [partnerForm.identifier]);

  const verifyPartnerOtp = useCallback(async () => {
    if (!partnerForm.otp) {
      alert("Please enter the OTP");
      return;
    }
    setPartnerForm((prev) => ({ ...prev, verifying: true }));
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: partnerForm.identifier,
          otp: partnerForm.otp,
          audience: "provider",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Invalid OTP");
        return;
      }
      alert(data.message || "Login successful");
      setPartnerForm(partnerInitialState());
      
      // First dispatch refresh event and call success callback
      window.dispatchEvent(new Event("auth:refresh"));
      onLoginSuccess?.({ type: "provider", profile: data.provider });
      
      // Small delay to allow session to be fetched before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      closeModal();
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      alert("Network error. Please try again");
    } finally {
      setPartnerForm((prev) => ({ ...prev, verifying: false }));
    }
  }, [partnerForm.email, partnerForm.otp, closeModal, onLoginSuccess, router]);

  const requestResidentOtp = useCallback(async () => {
    if (!residentForm.identifier) {
      alert("Please enter your email or phone number");
      return;
    }

    const inputType = detectInputType(residentForm.identifier);
    if (!inputType) {
      alert("Please enter a valid email or 10-digit phone number");
      return;
    }

    if (intent === "signup" && !residentForm.name.trim()) {
      alert("Please share your name");
      return;
    }

    // For signup, validate additional phone if provided and using email
    if (intent === "signup" && inputType === 'email' && residentForm.phone.trim()) {
      if (!/^[6-9]\d{9}$/.test(residentForm.phone.trim())) {
        alert("Phone number should be 10 digits starting with 6-9");
        return;
      }
    }

    setResidentForm((prev) => ({ ...prev, sending: true }));
    try {
      const payload = {
        identifier: residentForm.identifier,
        audience: "homeowner",
        intent: intent,
      };

      if (intent === "signup") {
        payload.metadata = {
          name: residentForm.name.trim(),
        };
        
        // If signing up with email, include phone in metadata
        if (inputType === 'email' && residentForm.phone.trim()) {
          payload.metadata.phone = normalizePhone(residentForm.phone.trim());
        }
        // If signing up with phone, include email in metadata if provided
        if (inputType === 'phone' && residentForm.email.trim()) {
          payload.metadata.email = residentForm.email.trim().toLowerCase();
        }
      }

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Unable to send OTP");
        return;
      }
      alert(data.message || "OTP sent successfully");
      setResidentForm((prev) => ({
        ...prev,
        step: "otp",
        identifierType: data.identifierType || inputType,
        otp: "",
        timer: RESEND_INTERVAL,
      }));
      setActivePanel("resident");
    } catch (error) {
      alert("Network error. Please try again");
    } finally {
      setResidentForm((prev) => ({ ...prev, sending: false }));
    }
  }, [residentForm.identifier, intent, residentForm.name, residentForm.phone, residentForm.email]);

  const verifyResidentOtp = useCallback(async () => {
    if (!residentForm.otp) {
      alert("Please enter the OTP");
      return;
    }
    setResidentForm((prev) => ({ ...prev, verifying: true }));
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          identifier: residentForm.identifier,
          otp: residentForm.otp,
          audience: "homeowner",
          intent: intent,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Invalid OTP");
        return;
      }
      alert(data.message || "Welcome back");
      setResidentForm(residentInitialState());
      
      // First dispatch refresh event and call success callback
      window.dispatchEvent(new Event("auth:refresh"));
      onLoginSuccess?.({ type: "resident", profile: data.homeowner });
      
      // Small delay to allow session to be fetched before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      closeModal();
      router.push("/resident");
      router.refresh();
    } catch (error) {
      alert("Network error. Please try again");
    } finally {
      setResidentForm((prev) => ({ ...prev, verifying: false }));
    }
  }, [residentForm.email, residentForm.otp, intent, closeModal, onLoginSuccess, router]);

  const changeResidentMode = useCallback((mode) => {
    setResidentForm((prev) => ({
      ...residentInitialState(),
      mode,
      identifier: mode === "login" ? prev.identifier : "",
      name: mode === "signup" ? prev.name : "",
    }));
  }, []);

  // Voice OTP handlers
  const [requestingVoiceOTP, setRequestingVoiceOTP] = useState(false);

  const requestPartnerVoiceOTP = useCallback(async () => {
    if (partnerForm.identifierType !== 'phone') {
      alert("Voice OTP is only available for phone numbers");
      return;
    }
    setRequestingVoiceOTP(true);
    try {
      const res = await fetch("/api/auth/voice-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: partnerForm.identifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to request voice call");
        return;
      }
      alert(data.message || "You will receive a call shortly with your OTP");
    } catch (error) {
      alert("Network error. Please try again");
    } finally {
      setRequestingVoiceOTP(false);
    }
  }, [partnerForm.identifier, partnerForm.identifierType]);

  const requestResidentVoiceOTP = useCallback(async () => {
    if (residentForm.identifierType !== 'phone') {
      alert("Voice OTP is only available for phone numbers");
      return;
    }
    setRequestingVoiceOTP(true);
    try {
      const res = await fetch("/api/auth/voice-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: residentForm.identifier }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to request voice call");
        return;
      }
      alert(data.message || "You will receive a call shortly with your OTP");
    } catch (error) {
      alert("Network error. Please try again");
    } finally {
      setRequestingVoiceOTP(false);
    }
  }, [residentForm.identifier, residentForm.identifierType]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4 py-6"
      onClick={closeModal}
    >
      <div 
        className={`relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-md transition hover:scale-105 hover:text-slate-700 hover:bg-white"
          aria-label="Close modal"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1">
          {defaultPanel === "partner" && (
            <section className="relative flex flex-col gap-6 p-8 lg:p-10 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
            <header className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-200">
                Service Partner
              </span>
              <h2 className="text-2xl font-semibold lg:text-3xl">Partner Control Center</h2>
              <p className="text-sm text-indigo-100/80">
                Access your bookings, earnings, and performance insights. Secure login protects your clients and payouts.
              </p>
            </header>

            <div className="rounded-2xl bg-white/6 p-6 shadow-inner shadow-slate-800/40">
              {partnerForm.step === "identifier" ? (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-200">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        {partnerForm.identifierType === 'phone' ? (
                          <svg className="h-4 w-4 text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-1-1.732l-8-4.618a2 2 0 00-2 0l-8 4.618A2 2 0 004 7v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </span>
                      <input
                        type="text"
                        value={partnerForm.identifier}
                        onChange={(event) => handlePartnerIdentifierChange(event.target.value)}
                        placeholder="partner@email.com or 9876543210"
                        className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-300 focus:bg-white/10 placeholder:text-indigo-200/60"
                      />
                    </div>
                    {partnerForm.identifier && (
                      <p className="mt-2 text-xs text-indigo-300">
                        {partnerForm.identifierType === 'email' ? '📧 Email detected' : 
                         partnerForm.identifierType === 'phone' ? '📱 Phone number detected' : 
                         '⚠️ Enter valid email or 10-digit phone'}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={requestPartnerOtp}
                    disabled={partnerForm.sending || !partnerForm.identifier || !partnerForm.identifierType}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {partnerForm.sending ? "Sending OTP..." : "Send secure OTP"}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-200">Verification Code</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-4 w-4 text-indigo-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3l-7.07-12.25a2 2 0 00-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
                        </svg>
                      </span>
                      <input
                        value={partnerForm.otp}
                        onChange={(event) => setPartnerForm((prev) => ({ ...prev, otp: event.target.value }))}
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        className="w-full rounded-xl border border-white/20 bg-white/5 py-3 pl-10 pr-4 text-center text-lg font-semibold tracking-[0.4em] text-white outline-none focus:border-emerald-300 focus:bg-white/10 placeholder:tracking-normal placeholder:text-indigo-200/60"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-indigo-200/70">
                    <button
                      type="button"
                      onClick={() => setPartnerForm(partnerInitialState())}
                      className="font-semibold uppercase tracking-widest hover:text-indigo-100"
                    >
                      Change {partnerForm.identifierType === 'phone' ? 'phone' : 'email'}
                    </button>
                    <button
                      type="button"
                      onClick={requestPartnerOtp}
                      disabled={partnerForm.sending || partnerForm.timer > 0}
                      className="font-semibold uppercase tracking-widest hover:text-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {partnerForm.timer > 0 ? `Resend in ${formatTimer(partnerForm.timer)}` : "Resend OTP"}
                    </button>
                  </div>
                  {/* Voice OTP Button - Only for phone numbers */}
                  {partnerForm.identifierType === 'phone' && (
                    <button
                      type="button"
                      onClick={requestPartnerVoiceOTP}
                      disabled={requestingVoiceOTP}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-2.5 text-xs font-semibold text-indigo-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {requestingVoiceOTP ? "Requesting call..." : "Request a Call Instead"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={verifyPartnerOtp}
                    disabled={partnerForm.verifying || !partnerForm.otp}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {partnerForm.verifying ? "Verifying..." : "Verify & enter dashboard"}
                  </button>
                </div>
              )}
            </div>

            <footer className="mt-auto space-y-2 text-xs text-indigo-100/60">
              <p className="font-semibold uppercase tracking-widest text-indigo-200">Why partners prefer OTP</p>
              <ul className="space-y-1">
                <li>• Protects your payout cycle and service reputation</li>
                <li>• Keeps client details safe under compliance guardrails</li>
                <li>• Never share OTP or device access with anyone</li>
              </ul>
            </footer>
          </section>
          )}

          {defaultPanel === "resident" && (
          <section className="relative flex flex-col gap-6 bg-white p-8 lg:p-10">
            <header className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                Home Resident
              </span>
              <h2 className="text-2xl font-semibold text-slate-900 lg:text-3xl">
                {intent === "login" ? "Welcome back" : "Plan your home services"}
              </h2>
              <p className="text-sm text-slate-600">
                {intent === "login" 
                  ? "Login to access your resident space, track requests, and manage your favorites."
                  : "Create a resident profile in seconds. Track requests, discover curated pros, and manage favorites seamlessly."}
              </p>
            </header>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              {residentForm.step === "identifier" ? (
                <div className="space-y-5">
                  {intent === "signup" && (
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">Full name</label>
                      <input
                        type="text"
                        value={residentForm.name}
                        onChange={(event) => setResidentForm((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="How can we address you?"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                  )}
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        {residentForm.identifierType === 'phone' ? (
                          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-1-1.732l-8-4.618a2 2 0 00-2 0l-8 4.618A2 2 0 004 7v10a2 2 0 002 2z" />
                          </svg>
                        )}
                      </span>
                      <input
                        type="text"
                        value={residentForm.identifier}
                        onChange={(event) => handleResidentIdentifierChange(event.target.value)}
                        placeholder="you@email.com or 9876543210"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                    {residentForm.identifier && (
                      <p className="mt-2 text-xs text-slate-500">
                        {residentForm.identifierType === 'email' ? '📧 Email detected - OTP will be sent to your email' : 
                         residentForm.identifierType === 'phone' ? '📱 Phone detected - OTP will be sent via SMS' : 
                         '⚠️ Enter valid email or 10-digit phone number'}
                      </p>
                    )}
                  </div>
                  {/* Show additional phone field when signing up with email */}
                  {intent === "signup" && residentForm.identifierType === 'email' && (
                    <div>
                      <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
                        <span>Phone Number</span>
                        <span className="text-[10px] font-semibold text-indigo-500">Required for service bookings</span>
                      </label>
                      <input
                        type="tel"
                        value={residentForm.phone}
                        maxLength={10}
                        onChange={(event) => setResidentForm((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, '') }))}
                        placeholder="10-digit phone number"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                  )}
                  {/* Show additional email field when signing up with phone */}
                  {intent === "signup" && residentForm.identifierType === 'phone' && (
                    <div>
                      <label className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-500">
                        <span>Email (optional)</span>
                        <span className="text-[10px] font-semibold text-indigo-500">For booking confirmations</span>
                      </label>
                      <input
                        type="email"
                        value={residentForm.email}
                        onChange={(event) => setResidentForm((prev) => ({ ...prev, email: event.target.value }))}
                        placeholder="you@email.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={requestResidentOtp}
                    disabled={residentForm.sending || !residentForm.identifier || !residentForm.identifierType || (intent === "signup" && !residentForm.name) || (intent === "signup" && residentForm.identifierType === 'email' && !residentForm.phone)}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {intent === "signup"
                      ? residentForm.sending ? "Sharing OTP..." : "Create account with OTP"
                      : residentForm.sending ? "Sending OTP..." : `Send OTP ${residentForm.identifierType === 'phone' ? 'via SMS' : 'to email'}`}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Enter one-time code {residentForm.identifierType === 'phone' ? '(sent via SMS)' : '(sent to email)'}
                    </label>
                    <input
                      value={residentForm.otp}
                      onChange={(event) => setResidentForm((prev) => ({ ...prev, otp: event.target.value }))}
                      maxLength={6}
                      placeholder="6-digit OTP"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-center text-lg font-semibold tracking-[0.4em] text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => setResidentForm((prev) => ({ ...residentInitialState(), mode: prev.mode }))}
                      className="font-semibold uppercase tracking-widest hover:text-slate-700"
                    >
                      Change {residentForm.identifierType === 'phone' ? 'phone' : 'email'}
                    </button>
                    <button
                      type="button"
                      onClick={requestResidentOtp}
                      disabled={residentForm.sending || residentForm.timer > 0}
                      className="font-semibold uppercase tracking-widest text-indigo-500 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {residentForm.timer > 0 ? `Resend in ${formatTimer(residentForm.timer)}` : "Resend OTP"}
                    </button>
                  </div>
                  {/* Voice OTP Button - Only for phone numbers */}
                  {residentForm.identifierType === 'phone' && (
                    <button
                      type="button"
                      onClick={requestResidentVoiceOTP}
                      disabled={requestingVoiceOTP}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {requestingVoiceOTP ? "Requesting call..." : "📞 Request a Call Instead"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={verifyResidentOtp}
                    disabled={residentForm.verifying || !residentForm.otp}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {residentForm.verifying
                      ? "Verifying..."
                      : intent === "signup"
                        ? "Create my resident space"
                        : "Access resident space"}
                  </button>
                </div>
              )}
            </div>

            <footer className="mt-auto space-y-2 text-xs text-slate-500">
              <p className="font-semibold uppercase tracking-widest text-slate-600">Inside your resident space</p>
              <ul className="space-y-1">
                <li>• Track service requests with live status</li>
                <li>• Save trusted experts and repeat bookings</li>
                <li>• Explore curated maintenance plans for every season</li>
              </ul>
            </footer>
          </section>
          )}
        </div>

        <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center text-xs text-slate-500">
          By continuing, you agree to follow our Terms of Service and Privacy Policy. We protect your data with enterprise-grade security.
        </div>
      </div>
    </div>
  );
}