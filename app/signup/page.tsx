"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  const router = useRouter();


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      // ✅ success
      router.push("/signin"); // eller auto login (se trin 3)
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Create an account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to get started.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800">
                First name:
              </label>
              <input type="text" required value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Anders"
                className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none"
              />
              <label className="block text-sm font-medium text-gray-800">
                Last name:
              </label>
              <input type="text" required value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Andersen"
                className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none"
              />
              <label className="block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Confirm password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-2 block w-full rounded-xl border border-gray-200 px-4 py-3 shadow-sm focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-500">
          By signing up, you agree to your organization’s policies.
        </p>
      </div>
    </main>
  );
}
