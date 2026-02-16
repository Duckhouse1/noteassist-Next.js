"use client";

import { useState } from "react";
import { signUpOrg } from "./action";

export default function SignUpPageCompany() {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      e.preventDefault();
      setError("Passwords do not match");
      return;
    }

    setError(null);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-black mb-2">
          Create company account
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Enter your company details to get started
        </p>

        <form className="space-y-4" action={signUpOrg} onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-black mb-1">Company name</label>
            <input
              name="company"
              type="text"
              required
              placeholder="Acme Inc."
              className="w-full rounded-md px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">
              Website <span className="text-gray-500">(optional)</span>
            </label>
            <input
              name="website"
              type="url"
              placeholder="https://acme.com"
              className="w-full rounded-md px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* <div>
            <label className="block text-sm text-black mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full rounded-md px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              placeholder="Repeat your password"
              className="w-full rounded-md px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div> */}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-md transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
