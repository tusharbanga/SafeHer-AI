import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BrandLogo } from "@/components/safeher/brand";
import { GlassCard } from "@/components/safeher/glass-card";
import { GradientButton } from "@/components/safeher/gradient-button";
import { Aurora } from "@/components/safeher/aurora";
import { Particles } from "@/components/safeher/particles";
import { firebaseSignInWithGoogle } from "@/lib/auth";
import { authApi, saveAuthSession } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — SafeHer AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleEmailLogin = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.login({ email, password });
      saveAuthSession(response.data);
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.register({ name, email, phone, password });
      saveAuthSession(response.data);
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }

    setError(null);
    try {
      await authApi.forgotPassword({ email });
      setError("Password reset link sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset link.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await firebaseSignInWithGoogle();
      navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in with Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Aurora />
      <Particles count={20} />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="absolute left-1/2 top-10 -translate-x-1/2">
          <BrandLogo size={42} />
        </div>

        <GlassCard className="rounded-[32px] border border-white/20 bg-white/70 p-10 shadow-2xl backdrop-blur-2xl">
          <h1 className="text-center text-4xl font-extrabold tracking-tight">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-center text-base leading-6 text-muted-foreground">
            {mode === "login" ? "Sign in using your email or Google account to continue." : "Create your SafeHer AI account."}
          </p>

          {error ? <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{error}</div> : null}

          <div className="mt-6 flex flex-col gap-4">
            {mode === "register" && (
              <>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-white/20 bg-white/80 px-5 text-gray-900 placeholder:text-gray-400 outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-white/20 bg-white/80 px-5 text-gray-900 placeholder:text-gray-400 outline-none"
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 w-full rounded-2xl border border-white/20 bg-white/80 px-5 text-gray-900 placeholder:text-gray-400 outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 w-full rounded-2xl border border-white/20 bg-white/80 px-5 text-gray-900 placeholder:text-gray-400 outline-none"
            />
            <div className="flex items-center justify-between gap-4 px-1 text-sm">
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Create Account" : "Back to Login"}
              </button>
            </div>
            <GradientButton
              onClick={mode === "login" ? handleEmailLogin : handleRegister}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Please wait..." : mode === "login" ? "Login with Email" : "Create Account"}
            </GradientButton>
          </div>

          <div className="my-5 text-center text-sm text-muted-foreground">OR</div>

          <SocialBtn
            label={isSubmitting ? "Please wait..." : "Continue with Google"}
            onClick={handleGoogleSignIn}
            fullWidth
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => navigate({ to: "/guardian/login" })}
            className="mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary to-fuchsia-500 px-6 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
          >
            🛡️ Guardian Login
          </button>

          <div className="mt-8 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 End-to-end encrypted • AI Protected • Secure Authentication
            </p>
          </div>
        </GlassCard>

        <Link to="/" className="mx-auto mt-8 text-sm text-muted-foreground transition-colors hover:text-foreground">← Back to home</Link>
      </div>
    </div>
  );
}

function SocialBtn({ label, onClick, fullWidth = false, disabled = false }: { label: string; onClick?: () => void; fullWidth?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/80 px-6 text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${fullWidth ? 'w-full' : ''}`}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1a6.2 6.2 0 010-12.4c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2 12 2a10 10 0 100 20c5.8 0 9.6-4 9.6-9.7 0-.7-.1-1.2-.2-1.8H12z"/></svg>
      {label}
    </button>
  );
}