import { Action } from "../(app)/[company]/dashboard/sections/frontPage";
import { OpenAIResponse } from "../types/OpenAI";

const extractInfoBasedOnAction = async (noteContent: string,action: Action): Promise<OpenAIResponse> => {
    const response = await fetch('/api/AzureOpenAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteContent, action })
    });

    if (!response.ok) throw new Error('Failed to call OpenAI API');
    const data = response.json()
    console.log(data);
    return data;
};

const OpenAIService = {
    extractInfoBasedOnAction
}
export default OpenAIService