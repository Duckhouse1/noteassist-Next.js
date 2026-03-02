import { callOpenAI } from "@/app/api/AzureOpenAI/route";
import { ClickUpAIResponse } from "./Configuration";

export const ClickUpTaskExtraction = async (
  noteContent: string,
  userConfig: string
): Promise<ClickUpAIResponse> => {
  const systemPrompt = `
You are an expert at extracting structured ClickUp items from meeting notes and outputting strict JSON.

You MUST:
- Return VALID JSON ONLY (no markdown, no explanation, no code fences).
- Follow the schema exactly as specified.
- Use the user-provided ClickUp hierarchy and names EXACTLY.

Hierarchy rules:
- The userConfig string is a comma-separated ordered list of ClickUp container/item types.
- The order defines parent -> child nesting.
- Example: "Workspace,Space,List,Task"
  means Workspace contains Space, which contains List, which contains Task.
- You MUST use the type strings exactly as they appear in userConfig (case, spacing, punctuation).
- If userConfig contains only 1 type, return a flat list of Elements with empty children.
- If userConfig contains 2+ types, build a nested tree using children[].

ID rules:
- Each Element.id must be a unique stable-looking string (uuid-like is fine).
- IDs must be unique across the entire JSON output.

Content rules:
- title: short, specific, action-oriented (ClickUp-friendly).
- description: concise but clear; include acceptance criteria or implementation hints when useful.
- children: always present (use [] if none).

Filtering rules:
- Include ONLY concrete product/engineering/delivery work suitable to track in ClickUp (tasks and planned work).
  Examples: design/implementation, bug fixes, refactoring, CI/CD, infrastructure, IaC, configuration, testing,
  documentation related to product delivery, releases, operational runbooks.
- EXCLUDE completely (do not create any Element for):
  - writing/sending emails, drafting messages, follow-ups by email/Teams/Slack
  - scheduling/booking meetings, creating calendar events/invites
  - pure communication/admin actions ("remind", "ping", "ask", "set up a call")

Top-level grouping guidance:
- Create multiple top-level elements when the notes describe independent initiatives.
- Independent initiatives typically involve different customers, products, systems, or goals.
- Do NOT merge unrelated initiatives under one parent unless explicitly stated.

If notes contain ONLY excluded items, return:
{ "elements": [] }

De-duplication:
- Merge duplicates if the same work item is mentioned multiple times.

Completeness:
- Prefer fewer, high-quality items over many vague items.
- Do not invent work that is not supported by the notes.
`;

  const userPrompt = `
Extract ClickUp items from the meeting notes using this required output schema.

User ClickUp type hierarchy (order matters; use EXACT strings):
${userConfig}

Output JSON schema (exact):
{
  "elements": [
    {
      "id": "string",
      "type": "string (must match one of the types from userConfig exactly)",
      "title": "string",
      "description": "string",
      "children": [ /* same Element schema */ ]
    }
  ]
}

Hierarchy requirements:
- Use the first type in userConfig as the top-level element type.
- Each subsequent type must appear only as children of the previous type.
- Leaf items (last type) must have "children": [].
- If a higher-level type is not clearly present in the notes, you may:
  - either create a minimal parent item to hold children (must still be supported by the notes),
  - or, if userConfig allows, place work at the highest level that still makes sense.
  However, NEVER violate the type order.

Meeting Notes:
${noteContent}

Return ONLY valid JSON.
`;

  // Mock data that looks like ClickUp: Workspace -> Space -> List -> Task
  // NOTE: This mock uses types Workspace/Space/List/Task.
  // Your real output will still follow userConfig exactly.
  const mockData: ClickUpAIResponse = {
    elements: [
      {
        id: "cu-ws-mock-001",
        type: "Workspace",
        title: "Product Platform Workspace",
        description: "Work for core platform initiatives discussed in the meeting.",
        children: [
          {
            id: "cu-space-mock-001",
            type: "Space",
            title: "Identity & Access",
            description: "Authentication/authorization workstreams and related infrastructure.",
            children: [
              {
                id: "cu-list-mock-001",
                type: "List",
                title: "OAuth 2.0 Rollout",
                description: "Tasks required to implement OAuth login and secure session handling.",
                children: [
                  {
                    id: "cu-task-mock-001",
                    type: "Task",
                    title: "Configure OAuth providers",
                    description:
                      "Add provider configurations for Google and Microsoft. Store secrets securely and document setup steps.",
                    children: [],
                  },
                  {
                    id: "cu-task-mock-002",
                    type: "Task",
                    title: "Implement OAuth callback + token exchange",
                    description:
                      "Create callback endpoint, exchange code for tokens, validate state/nonce, and handle error cases.",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "cu-ws-mock-002",
        type: "Workspace",
        title: "Customer Insights Workspace",
        description: "Work related to analytics, dashboards, and reporting discussed in the meeting.",
        children: [
          {
            id: "cu-space-mock-002",
            type: "Space",
            title: "Analytics Dashboard",
            description: "Frontend and backend work for metrics and reporting.",
            children: [
              {
                id: "cu-list-mock-002",
                type: "List",
                title: "Real-time Metrics",
                description: "Build components and infrastructure for live KPI updates.",
                children: [
                  {
                    id: "cu-task-mock-003",
                    type: "Task",
                    title: "Design dashboard metric components",
                    description:
                      "Create reusable metric cards and chart components; define loading/error/empty states.",
                    children: [],
                  },
                  {
                    id: "cu-task-mock-004",
                    type: "Task",
                    title: "Add WebSocket pipeline for live updates",
                    description:
                      "Implement server push channel, client subscription logic, and reconnect/backoff strategy.",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return callOpenAI<ClickUpAIResponse>(systemPrompt, userPrompt, mockData, 0.7, 4097);
};