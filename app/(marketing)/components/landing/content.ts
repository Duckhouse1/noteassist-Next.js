export const navItems = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Integrations", href: "#integrations" },
  { label: "Security", href: "#security" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const featureCards = [
  {
    title: "Notes → Actions (in one flow)",
    desc: "Write meeting notes like normal, then map highlights to actions your org actually needs.",
  },
  {
    title: "AI generates structured payloads",
    desc: "For each selected action, generate clean JSON you can use to create work items, emails, meetings, uploads, and more.",
  },
  {
    title: "Preview + edit before executing",
    desc: "Everything is human-reviewable. Adjust titles, owners, dates, and descriptions before you hit “Create”.",
  },
  {
    title: "Organizations & shared knowledge",
    desc: "Create an org, invite teammates, and keep notes + action templates consistent across teams.",
  },
  {
    title: "Connect once with OAuth",
    desc: "Link Azure DevOps, Outlook, SharePoint, Jira, ClickUp, Notion, etc. and keep sessions smooth.",
  },
  {
    title: "Built for enterprise hygiene",
    desc: "Encrypted storage, scoped permissions, and clear audit-friendly boundaries around automations.",
  },
];

export const integrations = [
  { name: "Azure DevOps", note: "Create work items" },
  { name: "Outlook", note: "Draft emails & meetings" },
  { name: "SharePoint", note: "Upload cleaned notes" },
  { name: "Jira", note: "Issues & epics" },
  { name: "ClickUp", note: "Tasks & docs" },
  { name: "Notion", note: "Pages & databases" },
];

export const pricing = [
  {
    name: "Starter",
    price: "Free",
    tagline: "For trying the workflow",
    bullets: ["Personal workspace", "Basic actions", "Preview & edit", "1 integration"],
    cta: "Get started",
    href: "/signup",
    featured: false,
  },
  {
    name: "Team",
    price: "$12",
    tagline: "Per user / month",
    bullets: [
      "Organizations & shared notes",
      "Unlimited actions",
      "Multiple integrations",
      "Action templates",
      "Priority generation queue",
    ],
    cta: "Start Team plan",
    href: "/signup",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "Security + governance",
    bullets: [
      "SSO/SAML (optional)",
      "Custom retention policies",
      "Advanced audit exports",
      "Dedicated Azure resources (optional)",
      "Support SLA",
    ],
    cta: "Contact sales",
    href: "/contact",
    featured: false,
  },
];

export const faqs = [
  {
    q: "How does the AI part work?",
    a: "You choose one or more actions. For each action, the app calls Azure OpenAI and returns structured JSON for that action type. You then review and edit the preview before executing.",
  },
  {
    q: "Do you store tokens for integrations?",
    a: "Integrations are connected via OAuth. Tokens are stored encrypted so you can avoid re-authentication loops and keep the workflow smooth.",
  },
  {
    q: "Can we share notes inside an organization?",
    a: "Yes. Users belong to an organization, and orgs can share notes, action templates, and consistent automation patterns across teams.",
  },
  {
    q: "Can we prevent accidental creation of items?",
    a: "Yes. The preview step is designed as a guardrail. You can also add org policies like requiring confirmation for certain actions.",
  },
  {
    q: "Which platforms are supported?",
    a: "The landing page highlights Azure DevOps, Outlook, SharePoint, ClickUp, Jira, Notion — and the system can expand as you add connectors.",
  },
  {
    q: "Where is data stored?",
    a: "Data is stored in Azure SQL (MSSQL) with encryption and standard transport security. You can also add stricter org-level controls as you grow.",
  },
];