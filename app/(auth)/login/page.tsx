"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      setError("Invalid credentials");
      setIsSubmitting(false);
      return;
    }

    const res = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });

    setIsSubmitting(false);

    if (res?.error) {
      setError("Wrong email or password");
      return;
    }

    // router.push(res?.url ?? "/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        <div className="mb-8">
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to continue.</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800">Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="rounded-full bg-gray-50 px-2 py-1">Secure sign-in</span>
              <Link href="/signup" className="hover:text-gray-700">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
