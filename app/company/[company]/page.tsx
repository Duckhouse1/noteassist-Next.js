import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ company: string }>;
};

export default async function CompanyLoginPage({ params }: PageProps) {
  const { company: companyName } = await params;

  async function login(formData: FormData) {
    "use server";

    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("Invalid credentials");
    }

    const cookieStore = await cookies();
    cookieStore.set(
      "NoteAssistSession",
      JSON.stringify({ company: companyName, email }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    redirect(`/company/${companyName}/dashboard`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              NoteAssist
            </div>

            <div className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
              {companyName}
            </div>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue to <span className="font-medium">{companyName}</span>.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form action={login} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              Sign in
            </button>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="rounded-full bg-gray-50 px-2 py-1">
                Secure sign-in
              </span>
              <span className="hover:text-gray-700">
                Having trouble? Contact your admin
              </span>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          By continuing you agree to your company’s policies.
        </p>
      </div>
    </main>
  );
}
