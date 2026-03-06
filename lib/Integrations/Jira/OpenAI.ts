import { callOpenAI } from "@/app/api/AzureOpenAI/route";
import { JiraTasksContent } from "@/app/types/OpenAI";

export const JiraIssueExtraction = async (
    noteContent: string,
    userConfig: string
): Promise<JiraTasksContent> => {
    const systemPrompt = `
You are an expert at extracting structured Jira issues from meeting notes and outputting strict JSON.

You MUST:
- Return VALID JSON ONLY (no markdown, no explanation, no code fences).
- Follow the schema exactly as specified.
- Use the user-provided issue type hierarchy and names EXACTLY.

Type hierarchy:
- The userConfig string is a comma-separated ordered list of Jira issue types.
- The order defines parent -> child nesting.
- Example: "Epic,Story,Task"
  means Epic contains Story, which contains Task.
- You MUST use the type strings exactly as they appear in userConfig (case, spacing, punctuation).
- If userConfig contains only 1 type, return a flat list of elements with empty children.
- If userConfig contains 2+ types, build a nested tree using children[].

ID rules:
- Each element.id must be a unique stable-looking string (uuid-like is fine).
- IDs must be unique across the entire JSON output.

Content rules:
- title: short, specific, action-oriented (suitable as a Jira issue summary).
- description: concise but clear; include acceptance criteria or implementation hints when useful.
- children: always present (use [] if none).

Filtering rules:
- Include ONLY concrete engineering / delivery work suitable for Jira.
  Examples: design/implementation, bug fixes, refactoring, CI/CD pipelines, infrastructure,
  IaC, configuration, testing, documentation related to product delivery, releases.
- EXCLUDE completely (do not create any element for):
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
Extract Jira issues from the meeting notes using this required output schema.

User issue type hierarchy (order matters; use EXACT strings):
${userConfig}

Output JSON schema (exact):
{
  "elements": [
    {
      "id": "string",
      "type": "string (must match one of the types from userConfig exactly)",
      "title": "string",
      "description": "string",
      "children": [ /* same element schema */ ]
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

    const mockData: JiraTasksContent = {
        elements: [
            {
                id: "jira-epic-mock-001",
                type: "Epic",
                title: "User Authentication System",
                description: "Implement comprehensive user authentication and authorization.",
                children: [
                    {
                        id: "jira-story-mock-001",
                        type: "Feature",
                        title: "Implement OAuth 2.0 Login",
                        description: "Add OAuth 2.0 authentication flow for third-party login providers.",
                        children: [
                            {
                                id: "jira-task-mock-001",
                                type: "Opgave",
                                title: "Configure OAuth provider settings",
                                description: "Set up provider configs for Google and Microsoft; store secrets securely.",
                                children: [],
                            },
                            {
                                id: "jira-task-mock-002",
                                type: "Opgave",
                                title: "Implement OAuth callback handler",
                                description: "Create the callback endpoint, exchange auth code for tokens, validate state.",
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: "jira-epic-mock-002",
                type: "Epic",
                title: "Analytics Dashboard",
                description: "Build real-time metrics and reporting dashboard.",
                children: [
                    {
                        id: "jira-story-mock-002",
                        type: "Feature",
                        title: "Real-time Metrics Display",
                        description: "Develop dashboard components to show live system metrics and KPIs.",
                        children: [
                            {
                                id: "jira-task-mock-003",
                                type: "Opgave",
                                title: "Design metric card components",
                                description: "Create reusable chart and metric card components with loading/error states.",
                                children: [],
                            },
                            {
                                id: "jira-task-mock-004",
                                type: "Opgave",
                                title: "Set up WebSocket connection for live updates",
                                description: "Implement server push channel and client subscription with reconnect logic.",
                                children: [],
                            },
                        ],
                    },
                ],
            },
        ],
    };

    return callOpenAI<JiraTasksContent>(systemPrompt, userPrompt, mockData, 0.7, 4097);
};