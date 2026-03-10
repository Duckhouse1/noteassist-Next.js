export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Terms of Use</h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">1. Acceptance of terms</h2>
          <p>By accessing or using Norbit, you agree to be bound by these Terms of Use. If you do not agree, please do not use the service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">2. Description of service</h2>
          <p>Norbit is an AI-powered productivity tool that integrates with third-party services including Azure DevOps, Jira, ClickUp, and Microsoft Teams. The service allows users to manage tasks and workflows across these platforms from a single interface.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">3. Acceptable use</h2>
          <p>You agree to use Norbit only for lawful purposes and in accordance with these terms. You may not use Norbit to violate any applicable laws, infringe on the rights of others, or interfere with the operation of the service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">4. Your account</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Please notify us immediately of any unauthorized use of your account.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">5. Third-party integrations</h2>
          <p>Norbit connects to third-party services on your behalf. You are responsible for ensuring you have the right to use those services and that your use complies with their respective terms of service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">6. Disclaimer of warranties</h2>
          <p>Norbit is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that any defects will be corrected.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">7. Limitation of liability</h2>
          <p>To the maximum extent permitted by law, Norbit shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">8. Changes to terms</h2>
          <p>We reserve the right to modify these terms at any time. We will notify users of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">9. Contact</h2>
          <p>Questions about these terms? Contact us at <a href="mailto:legal@norbit.app" className="text-violet-600 hover:underline">legal@norbit.app</a>.</p>
        </section>
      </div>
    </main>
  )
}