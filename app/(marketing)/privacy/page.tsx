export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">1. What we collect</h2>
          <p>Norbit collects your name, email address, and OAuth tokens from connected third-party services (Azure DevOps, Jira, ClickUp, Microsoft Outlook) solely to provide the Norbit service. We do not collect any data beyond what is necessary to operate the product.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">2. How we use your data</h2>
          <p>Your data is used exclusively to operate Norbit — to authenticate you, display your work items, and execute actions on your behalf in connected integrations. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">3. Data storage & security</h2>
          <p>All data is stored securely and encrypted at rest. Integration tokens are stored per-user and are never shared across accounts. We use industry-standard security practices to protect your information.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">4. Third-party services</h2>
          <p>Norbit integrates with Microsoft Teams, Azure DevOps, Jira, and ClickUp. When you connect these services, their respective privacy policies also apply. We only request the minimum permissions required to provide the service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">5. Data deletion</h2>
          <p>You can request deletion of your account and all associated data at any time by contacting us. Upon deletion, all stored tokens and personal data will be permanently removed within 30 days.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-800 mb-2">6. Contact</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@norbit.app" className="text-violet-600 hover:underline">privacy@norbit.app</a>.</p>
        </section>
      </div>
    </main>
  )
}