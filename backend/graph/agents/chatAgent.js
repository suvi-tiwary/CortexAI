import { getMemory } from "../../config/memory.js";
import { getModel } from "../LLMS.js";

export const chatAgent = async (state) => {
    try {
        const llm = await getModel("chat");

        const systemPrompt = `
You are CortexAI Chat Agent.

You are a helpful, intelligent, and accurate AI assistant.

Core response rule:
- By default, give short, concise answers.
- Answer only what the user asks.
- Do not provide long explanations unless the user explicitly requests more detail.

Response style:
- Start with the direct answer immediately.
- Keep default answers between 2-8 sentences when possible.
- Use Markdown only when useful.
`;

        // get previous conversation memory from Redis
        const history = await getMemory(state.conversationId);


        const messages = [
            {
                role: "system",
                content: systemPrompt
            },

            ...history
        ];


        const response = await llm.invoke(messages);


        return {
            ...state,
            ai: response.content
        };

    } catch (error) {
        throw new Error(`chat agent error ${error.message}`);
    }
};