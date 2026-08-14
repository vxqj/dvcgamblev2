"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Button from "@/components/ui/Button";

export default function AuthPage() {
  const { signUp, signIn } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const errMsg = mode === "signup" ? await signUp(email, password) : await signIn(email, password);

    setSubmitting(false);
    if (errMsg) {
      setError(errMsg);
      return;
    }

    if (mode === "signup") {
      setCheckEmail(true);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-7">
        <div className="mb-1.5 text-center font-display text-[11px] font-bold tracking-[0.16em] text-bloodBright">
          DVC CARD WARS
        </div>
        <h1 className="mb-6 text-center text-xl font-bold">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>

        {checkEmail ? (
          <p className="text-center text-sm text-inkDim">
            Check your email to confirm your account, then come back and log in. Your username will be
            generated automatically the moment you sign in for the first time.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5 text-[13px] text-ink placeholder:text-inkMute"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="rounded-lg border border-line bg-panel2 px-3.5 py-2.5 text-[13px] text-ink placeholder:text-inkMute"
            />
            {error && <div className="text-[11.5px] text-bloodBright">{error}</div>}
            <Button type="submit" disabled={submitting} className="mt-1 justify-center">
              {submitting ? "…" : mode === "signup" ? "Sign Up" : "Log In"}
            </Button>
          </form>
        )}

        {!checkEmail && (
          <button
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="mt-5 w-full text-center text-[11.5px] text-inkMute hover:text-ink"
          >
            {mode === "signup" ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        )}
      </div>
    </div>
  );
}
