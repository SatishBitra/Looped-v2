import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { setAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("sandy@looped.agency");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);

    // Simulated auth login
    setTimeout(() => {
      setIsLoading(false);
      setAuthenticated(email);
      toast.success("Welcome back!", {
        description: "Logged into Looped workspace successfully.",
      });
      navigate({ to: "/home" });
    }, 800);
  };

  const handleForgotSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please provide your email address");
      return;
    }
    setForgotSubmitted(true);
    setTimeout(() => {
      toast.success("Reset link sent!", {
        description: `Check your inbox at ${forgotEmail}`,
      });
    }, 400);
  };

  return (
    <div
      id="login-page-container"
      className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 select-none overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/assets/bg-login.png')",
        backgroundColor: "#9ec5f0",
      }}
    >
      {/* Subtle concentric orbital rings watermark behind card (matching reference layout) */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-0"
        aria-hidden="true"
      >
        <div className="w-[480px] h-[480px] rounded-full border border-white/20 sm:w-[620px] sm:h-[620px]" />
        <div className="absolute w-[760px] h-[760px] rounded-full border border-white/15 sm:w-[940px] sm:h-[940px]" />
        <div className="absolute w-[1040px] h-[1040px] rounded-full border border-white/10 sm:w-[1260px] sm:h-[1260px]" />
      </div>

      {/* Top Left: Increased logo size as requested */}
      <header id="login-header-logo" className="fixed top-6 left-6 md:top-8 md:left-10 z-20">
        <button
          type="button"
          onClick={() => navigate({ to: "/home" })}
          className="flex items-center gap-2 transition-transform hover:scale-[1.02] focus:outline-none cursor-pointer"
          title="Looped Home"
        >
          <img
            src="/assets/v2-black.png"
            alt="Looped"
            className="h-10 md:h-12 lg:h-14 w-auto object-contain drop-shadow-sm"
          />
        </button>
      </header>

      {/* Center Login Form Card styled with Looped Design System */}
      <motion.main
        id="login-card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px] sm:max-w-[440px] bg-white/85 dark:bg-[#1C1C22]/85 backdrop-blur-2xl border border-[#E7E7EC]/90 dark:border-[#323238] shadow-[var(--shadow-soft)] rounded-[28px] sm:rounded-[32px] p-7 sm:p-9 text-center"
      >
        {/* Starting of the form: logo icon with black filled bg using assets/v2-white.png */}
        <div
          id="login-icon-badge"
          className="w-14 h-14 rounded-2xl bg-[#111111] flex items-center justify-center mx-auto shadow-md mb-4.5 ring-4 ring-black/5"
        >
          <img src="/assets/v2-white.png" alt="Looped Icon" className="w-8 h-8 object-contain" />
        </div>

        {/* Headings according to Looped Brand Guidelines */}
        <h1
          id="login-title"
          className="text-[22px] sm:text-[24px] font-semibold tracking-tight text-[#111111] dark:text-white font-sans"
        >
          Sign in to Looped
        </h1>
        <p
          id="login-subtitle"
          className="text-[13px] text-[#757575] dark:text-[#A7A7A7] mt-1.5 leading-relaxed px-2 font-sans"
        >
          Enter your agency credentials to access projects, daily capacity, and team workflows.
        </p>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5 text-left">
          {/* Email Input */}
          <div
            id="login-email-container"
            className="group flex items-center gap-3 bg-[#F4F4F7]/90 dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] focus-within:border-[#111111] dark:focus-within:border-white focus-within:bg-white dark:focus-within:bg-[#232329] rounded-xl px-3.5 py-3 transition-all"
          >
            <Mail className="w-4 h-4 text-[#757575] group-focus-within:text-[#111111] dark:group-focus-within:text-white shrink-0" />
            <input
              id="login-email-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-0 outline-none text-sm text-[#111111] dark:text-white placeholder:text-[#757575]"
            />
          </div>

          {/* Password Input */}
          <div
            id="login-password-container"
            className="group flex items-center gap-3 bg-[#F4F4F7]/90 dark:bg-[#242428] border border-[#E7E7EC] dark:border-[#323238] focus-within:border-[#111111] dark:focus-within:border-white focus-within:bg-white dark:focus-within:bg-[#232329] rounded-xl px-3.5 py-3 transition-all"
          >
            <Lock className="w-4 h-4 text-[#757575] group-focus-within:text-[#111111] dark:group-focus-within:text-white shrink-0" />
            <input
              id="login-password-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-0 outline-none text-sm text-[#111111] dark:text-white placeholder:text-[#757575]"
            />
            <button
              id="login-toggle-password"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-[#757575] hover:text-[#111111] dark:hover:text-white focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-0.5">
            <button
              id="login-forgot-password-button"
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setForgotSubmitted(false);
                setIsForgotPasswordOpen(true);
              }}
              className="text-[12px] font-medium text-[#757575] hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Login CTA */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#111111] hover:bg-black text-white font-medium py-3 rounded-xl text-sm shadow-[var(--shadow-float)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      </motion.main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-md bg-white dark:bg-[#1E1E24] border border-[#E7E7EC] dark:border-[#323238] rounded-[24px] p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(false)}
                className="absolute top-5 right-5 text-[#757575] hover:text-[#111111] dark:hover:text-white"
              >
                ✕
              </button>

              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F4F4F7] dark:bg-[#242428] grid place-items-center mx-auto mb-3 text-[#111111] dark:text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#111111] dark:text-white">
                  Reset Password
                </h3>
                <p className="text-xs text-[#757575] mt-1 max-w-xs mx-auto">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              {forgotSubmitted ? (
                <div className="mt-6 text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Instructions sent!</span>
                  </div>
                  <p className="text-xs text-[#757575]">
                    If an account exists for {forgotEmail}, you will receive a reset email shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#111111] text-white text-xs font-medium hover:bg-black transition cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 bg-[#F4F4F7] dark:bg-[#242428] rounded-xl px-3.5 py-3 border border-[#E7E7EC] dark:border-[#323238] focus-within:border-[#111111] dark:focus-within:border-white">
                    <Mail className="w-4 h-4 text-[#757575] shrink-0" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      className="w-full bg-transparent border-0 outline-none text-xs text-[#111111] dark:text-white placeholder:text-[#757575]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="flex-1 py-2.5 rounded-xl border border-[#E7E7EC] dark:border-[#323238] text-[#111111] dark:text-white text-xs font-medium hover:bg-[#F4F4F7] dark:hover:bg-[#242428] transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-[#111111] text-white text-xs font-medium hover:bg-black transition cursor-pointer"
                    >
                      Send Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
