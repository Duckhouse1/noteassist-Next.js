// Services/OpenAIService.ts
import { Action } from "../(app)/[company]/dashboard/sections/frontPage";
import { OpenAIResponse, DevOpsResponse, EmailDraft, MeetingSummary, TaskList, OpenAIContentType } from "../types/OpenAI";
const pattoken = process.env.OPEN_AI_API_KEY!
// Generic OpenAI call function
const callOpenAI = async <T extends OpenAIContentType>(systemPrompt: string, userPrompt: string, mockData: T, temperature: number = 0.3): Promise<T> => {

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer  `
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No content returned from OpenAI');
        }

        return JSON.parse(content) as T;

    } catch (error) {
        console.error('Error calling OpenAI:', error);
        console.log('Returning mock data due to API failure');
        return mockData;
    }
};

// Specific extraction functions
const OpenAIDevOpsTaskExtraction = async (noteContent: string): Promise<DevOpsResponse> => {
    const systemPrompt = `
You are an expert at extracting structured Azure DevOps work items from meeting notes.
Return valid JSON only. Do not include any text outside JSON.
`;

    const userPrompt = `
Analyze the following meeting notes and extract ONLY Azure DevOps work items: Features, Product Backlog Items (PBIs), and Tasks.

Hierarchy rules:
- Features contain PBIs
- PBIs contain Tasks

Inclusion criteria (what counts as a work item):
- Engineering or delivery work that would belong in Azure DevOps (e.g., design/implementation, bug fixes, refactoring, pipelines/CI/CD, infrastructure-as-code, configuration, testing, documentation related to the product, releases).

Exclusion criteria (MUST IGNORE completely — do NOT create any Feature/PBI/Task for these):
- Writing/sending emails, drafting messages, following up by email/Teams/Slack
- Scheduling/booking meetings, creating Outlook events/invites, calendar coordination
- Pure communication/admin actions (e.g., "remind X", "ping Y", "ask Z", "set up a call")

Important filtering rule:
- If a note describes ONLY communication or scheduling (email/meeting/calendar), omit it entirely.
- Only include items that result in concrete product/engineering/DevOps work.

Return the result as JSON with this exact structure:
{
  "features": [
    {
      "id": "unique-id",
      "title": "Feature title",
      "description": "Feature description",
      "pbis": [
        {
          "id": "unique-id",
          "title": "PBI title",
          "description": "PBI description",
          "tasks": [
            {
              "id": "unique-id",
              "title": "Task title",
              "description": "Task description"
            }
          ]
        }
      ]
    }
  ]
}

Meeting Notes:
${noteContent}

Return ONLY valid JSON.
`;


    const mockData: DevOpsResponse = {
        features: [
            {
                id: "feat-mock-001",
                title: "User Authentication System",
                description: "Implement comprehensive user authentication and authorization",
                pbis: [
                    {
                        id: "pbi-mock-001",
                        title: "Implement OAuth 2.0 Login",
                        description: "Add OAuth 2.0 authentication flow for third-party login providers",
                        tasks: [
                            {
                                id: "task-mock-001",
                                title: "Setup OAuth provider configuration",
                                description: "Configure OAuth settings for Google, Microsoft, and GitHub providers"
                            },
                            {
                                id: "task-mock-002",
                                title: "Implement OAuth callback handlers",
                                description: "Create backend endpoints to handle OAuth callbacks and token exchange"
                            }
                        ]
                    }
                ]
            },
            {
                id: "feat-mock-002",
                title: "Dashboard Analytics",
                description: "Create analytics dashboard with real-time metrics and reporting",
                pbis: [
                    {
                        id: "pbi-mock-002",
                        title: "Build Real-time Metrics Display",
                        description: "Develop dashboard components to show live system metrics and KPIs",
                        tasks: [
                            {
                                id: "task-mock-003",
                                title: "Design dashboard UI components",
                                description: "Create reusable chart and metric card components using React and Chart.js"
                            },
                            {
                                id: "task-mock-004",
                                title: "Implement WebSocket connection for live updates",
                                description: "Set up WebSocket infrastructure to push real-time data to dashboard clients"
                            }
                        ]
                    }
                ]
            }
        ]
    };

    return callOpenAI<DevOpsResponse>(systemPrompt, userPrompt, mockData);
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

    return callOpenAI<EmailDraft>(systemPrompt, userPrompt, mockData);
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

    return callOpenAI<MeetingSummary>(systemPrompt, userPrompt, mockData);
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

    return callOpenAI<TaskList>(systemPrompt, userPrompt, mockData);
};

// Generic extraction based on action
const extractInfoBasedOnAction = async (
    noteContent: string,
    action: Action
): Promise<OpenAIResponse> => {
    switch (action.key) {
        case "integrations":
            if (action.integration === "Azure-Devops") {
                const content = await OpenAIDevOpsTaskExtraction(noteContent);
                return { type: "devops_tasks", content };
            // } else if (action.integration === "Jira") {
            //     const content = await OpenAIDevOpsTaskExtraction(noteContent);
            //     return { type: "jira_tasks", content };
            } else {
                throw new Error(`Unsupported integration: ${action.integration}`);
            }

        case "email_outlook_draft": {
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

        case "schedule_outlook_meeting": {
            const content = await OpenAIEmailDraftExtraction(noteContent);
            return { type: "email_draft", content };
        }
        // case "attach_photo":
        //     throw new Error(`Action type ${action.key} not yet implemented`);

        default: {
            const exhaustiveCheck: never = action.key;
            throw new Error(`Unsupported action type: ${exhaustiveCheck}`);
        }
    }
};

const OpenAIService = {
    callOpenAI,
    OpenAIDevOpsTaskExtraction,
    OpenAIEmailDraftExtraction,
    OpenAIMeetingSummaryExtraction,
    OpenAITaskListExtraction,
    extractInfoBasedOnAction
};

export default OpenAIService;