import { getMemory } from "../../config/memory.js";
import { getModel } from "../LLMS.js";

export const chatAgent = async (state) => {
    try {
        const llm = await getModel("chat");

      const SearchContext = state.searchResults?.results
        ?.map((r) => `
          Title: ${r.title}
          URL: ${r.url}
          Content: ${r.content?.substring(0, 400)}`) .join("\n\n") || "";
        const systemPrompt = `

If web search results are provided, use them as the primary source.
If they are not provided, answer normally.


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

         Greeting style -
         when someone say Thank you - say chup kar pagle rulaye ga kya ...
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