// Services/OpenAIService.ts
import { NextRequest, NextResponse } from "next/server";
import { OpenAIContentType, DevOpsResponse, EmailDraft, MeetingSummary, TaskList, OpenAIResponse } from "@/app/types/OpenAI";
import { AzureOpenAI } from "openai";
import { Action } from "@/lib/Integrations/Types";
const pattoken = process.env.OPEN_AI_API_KEY!
const apiKey = process.env.AZURE_OPENAI_API_KEY!;
const falseApiKey = "notakey"
const apiVersion = "2024-04-01-preview";
const endpoint = "https://actionextractai.openai.azure.com/";
const fakeEndoint = "lalallal"
const modelName = "gpt-4o-mini";
const deployment = "gpt-4o-mini";
const options = { endpoint: fakeEndoint, apiKey: falseApiKey, deployment, apiVersion, };
const client = new AzureOpenAI(options);
// Generic OpenAI call function
const callOpenAI = async <T extends OpenAIContentType>(systemPrompt: string, userPrompt: string, mockData: T, temperature: number = 0.3, maxTokens: number): Promise<T> => {

    try {
        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            max_tokens: maxTokens,
            temperature: temperature,
            model: modelName,
            response_format: { type: "json_object" }
        });


        if (!response?.choices?.[0]?.message?.content) {
            throw new Error("Invalid OpenAI response structure");
        }

        return JSON.parse(response.choices[0].message.content) as T;

    } catch (error) {
        console.error("OpenAI error:", error);
        return mockData;
    }
};

// Specific extraction functions
const OpenAIDevOpsTaskExtraction = async (
    noteContent: string,
    userConfig: string
): Promise<DevOpsResponse> => {
    const systemPrompt = `
You are an expert at extracting structured engineering work items from meeting notes and outputting strict JSON.

You MUST:
- Return VALID JSON ONLY (no markdown, no explanation, no code fences).
- Follow the schema exactly as specified.
- Use the user-provided work item type hierarchy and names EXACTLY.

Type hierarchy:
- The userConfig string is a comma-separated ordered list of work item types.
- The order defines parent -> child nesting.
- Example: "Feature,Product Backlog Item,Task"
  means Feature contains Product Backlog Item, which contains Task.
- You MUST use the type strings exactly as they appear in userConfig (case, spacing, punctuation).
- If userConfig contains only 1 type, return a flat list of Elements with empty children.
- If userConfig contains 2+ types, build a nested tree using children[].

ID rules:
- Each Element.id must be a unique stable-looking string (uuid-like is fine).
- IDs must be unique across the entire JSON output.

Content rules:
- title: short, specific, action-oriented.
- description: concise but clear; include relevant acceptance criteria or implementation hints when useful.
- children: always present (use [] if none).

Filtering rules:
- Include ONLY concrete engineering / delivery work suitable for Azure DevOps.
  Examples: design/implementation, bug fixes, refactoring, pipelines/CI/CD, infrastructure, IaC, configuration, testing, documentation related to product delivery, releases.
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
Extract engineering work items from the meeting notes using this required output schema.

User work item type hierarchy (order matters; use EXACT strings):
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


    const mockData: DevOpsResponse = {
        elements: [
            {
                id: "feat-mock-001",
                type: "Epic",
                title: "User Authentication System",
                description: "Implement comprehensive user authentication and authorization",
                children: [
                    {

                        id: "pbi-mock-001",
                        type: "Feature",
                        title: "Implement OAuth 2.0 Login",
                        description: "Add OAuth 2.0 authentication flow for third-party login providers",
                        children: [
                            {
                                id: "task-mock-001",
                                type: "Task",
                                title: "Setup OAuth provider configuration",
                                description: "Configure OAuth settings for Google, Microsoft, and GitHub providers",
                                children: []
                            },
                            {
                                id: "task-mock-002",
                                type: "Task",
                                title: "Implement OAuth callback handlers",
                                description: "Create backend endpoints to handle OAuth callbacks and token exchange",
                                children: []
                            }
                        ]
                    }
                ]
            },
            {
                id: "feat-mock-002",
                type: "Epic",
                title: "Dashboard Analytics",
                description: "Create analytics dashboard with real-time metrics and reporting",
                children: [
                    {
                        id: "pbi-mock-002",
                        type: "Feature",
                        title: "Build Real-time Metrics Display",
                        description: "Develop dashboard components to show live system metrics and KPIs",
                        children: [
                            {
                                id: "task-mock-003",
                                type: "Task",
                                title: "Design dashboard UI components",
                                description: "Create reusable chart and metric card components using React and Chart.js",
                                children: []
                            },
                            {
                                id: "task-mock-004",
                                type: "Task",
                                title: "Implement WebSocket connection for live updates",
                                description: "Set up WebSocket infrastructure to push real-time data to dashboard clients",
                                children: []
                            }
                        ]
                    }
                ]
            }
        ]
    };

    return callOpenAI<DevOpsResponse>(systemPrompt, userPrompt, mockData, 0.7, 4097);
};

const OpenAIEmailDraftExtraction = async (noteContent: string): Promise<EmailDraft> => {
    const systemPrompt = 'You are an expert at creating professional email drafts from meeting notes in danish. Always return valid JSON only.';

    const userPrompt = `Create a professional email draft based on the following meeting notes:

${noteContent}

Return ONLY valid JSON with this structure:
{
  "subject": "Email subject line",
  "body": "Email body with proper formatting",
  "recipients": ["email1@example.com"]
}`;

    const mockData: EmailDraft = {
        subject: "Follow-up: Project Discussion",
        body: "Hi team,\n\nThank you for the productive meeting today. Here are the key takeaways...",
        recipients: ["team@example.com"]
    };

    return callOpenAI<EmailDraft>(systemPrompt, userPrompt, mockData, 0.5, 2000);
};

const OpenAIMeetingSummaryExtraction = async (noteContent: string): Promise<MeetingSummary> => {
    const systemPrompt = 'You are an expert at summarizing meeting notes. Always return valid JSON only.';

    const userPrompt = `Summarize the following meeting notes:

${noteContent}

Return ONLY valid JSON with this structure:
{
  "title": "Meeting title",
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["action 1", "action 2"],
  "attendees": ["person 1", "person 2"]
}`;

    const mockData: MeetingSummary = {
        title: "Project Planning Meeting",
        keyPoints: [
            "Discussed Q1 objectives",
            "Reviewed budget allocation"
        ],
        actionItems: [
            "Schedule follow-up meeting",
            "Prepare proposal draft"
        ],
        attendees: ["John Doe", "Jane Smith"]
    };

    return callOpenAI<MeetingSummary>(systemPrompt, userPrompt, mockData, 0.3, 2000);
};

const OpenAITaskListExtraction = async (noteContent: string): Promise<TaskList> => {
    const systemPrompt = 'You are an expert at extracting actionable tasks from meeting notes. Always return valid JSON only.';

    const userPrompt = `Extract actionable tasks from the following meeting notes:

${noteContent}

Return ONLY valid JSON with this structure:
{
  "tasks": [
    {
      "id": "unique-id",
      "title": "Task title",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD (optional)"
    }
  ]
}`;

    const mockData: TaskList = {
        tasks: [
            {
                id: "task-001",
                title: "Review project requirements",
                priority: "high",
                dueDate: "2024-02-10"
            },
            {
                id: "task-002",
                title: "Schedule team sync",
                priority: "medium"
            }
        ]
    };

    return callOpenAI<TaskList>(systemPrompt, userPrompt, mockData, 0.6, 2000);
};

// Generic extraction based on action
const extractInfoBasedOnAction = async (
    noteContent: string,
    action: Action
): Promise<OpenAIResponse> => {
    switch (action.integration) {
        case "azure-devops":
                console.log("Dette er user config: ");
                console.log(action.UserConfig);
                console.log("NOTE:", JSON.stringify(noteContent));

                const content = await OpenAIDevOpsTaskExtraction(noteContent, action.UserConfig ?? "");
                console.log("Dette er openAI response: ");
                console.log(content);
                return { type: "devops_tasks", content };
                // } else if (action.integration === "Jira") {
                //     const content = await OpenAIDevOpsTaskExtraction(noteContent);
                //     return { type: "jira_tasks", content };

        case "outlook": {
            const content = await OpenAIEmailDraftExtraction(noteContent);
            return { type: "email_draft", content };
        }

        // case "meeting_summary": {
        //     const content = await OpenAIMeetingSummaryExtraction(noteContent);
        //     return { type: "meeting_summary", content };
        // }

        // case "task_list": {
        //     const content = await OpenAITaskListExtraction(noteContent);
        //     return { type: "task_list", content };
        // }

        case "sharepoint": {
            const content = await OpenAIEmailDraftExtraction(noteContent);
            return { type: "email_draft", content };
        }

        case "jira": {
            const content = await OpenAIDevOpsTaskExtraction(noteContent, action.UserConfig ?? "");
            return { type: "jira_tasks", content };
        }

        // case "attach_photo":
        // case "attach_photo":
        //     throw new Error(`Action type ${action.key} not yet implemented`);
        default:
            throw new Error(`Unsupported action key: ${action.key}`);
    }
};

export async function POST(req: NextRequest) {
    try {
        const { noteContent, action }: { noteContent: string; action: Action } = await req.json();

        if (!noteContent || !action) {
            return NextResponse.json({ error: 'Missing noteContent or action' }, { status: 400 });
        }

        const result: OpenAIResponse = await extractInfoBasedOnAction(noteContent, action);
        return NextResponse.json(result);

    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}