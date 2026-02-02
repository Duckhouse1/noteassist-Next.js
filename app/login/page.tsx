import { redirect } from "next/navigation";

export default function LoginPageCompany() {
  async function login(formData: FormData) {
    "use server";

    const company = formData.get("company");
    if (typeof company !== "string") throw new Error("Invalid company");

    redirect(`/company/${company}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            NoteAssist
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your company to continue.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form action={login} className="space-y-5">
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-800"
              >
                Company
              </label>
              <input
                type="text"
                name="company"
                id="company"
                required
                placeholder="e.g. simplitize"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none ring-0 placeholder:text-gray-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
              <p className="mt-2 text-xs text-gray-500">
                This helps us route you to the right workspace.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              Continue
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} NoteAssist. All rights reserved.
        </p>
      </div>
    </main>
  );
}
