"use client";

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { login, signup, type AuthActionState } from "./actions";

const initialState: AuthActionState = { error: null };

export function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loginState, loginAction, loginPending] = useActionState(login, initialState);
  const [signupState, signupAction, signupPending] = useActionState(signup, initialState);
  const [googlePending, setGooglePending] = useState(false);

  const state = mode === "signin" ? loginState : signupState;
  const pending = mode === "signin" ? loginPending : signupPending;

  async function onGoogleSignIn() {
    setGooglePending(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/80 p-8 shadow-xl shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {mode === "signin"
            ? "Sign in to continue your practice"
            : "Start tracking your meditation sessions"}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void onGoogleSignIn()}
        disabled={googlePending}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10"
      >
        <GoogleIcon />
        {googlePending ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      <form
        key={mode}
        action={mode === "signin" ? loginAction : signupAction}
        className="grid gap-4"
      >
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-200">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/5 dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
          />
        </label>

        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-200">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="••••••••"
            className="rounded-xl border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-black/30 focus:ring-2 focus:ring-black/5 dark:border-white/10 dark:bg-white/5 dark:focus:border-white/30"
          />
        </label>

        {state.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black/85 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-white/85"
        >
          {pending
            ? "Please wait…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="font-medium text-gray-900 underline underline-offset-2 dark:text-white"
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.8 2.73v2.27h2.91c1.7-1.57 2.69-3.88 2.69-6.64z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.27c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.34C2.44 15.98 5.48 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71c-.18-.54-.28-1.11-.28-1.71s.1-1.17.28-1.71V4.95H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.05l2.99-2.34z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.95l2.99 2.34C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
