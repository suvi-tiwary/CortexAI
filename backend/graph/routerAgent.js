import { getModel } from "./LLMS.js"

export const routerAgent = async(state)=>{
     try {
          const llm = await getModel("router")
          const systemPrompt =`You are a Router Agent.

Your only job is to analyze the user's request and classify it into exactly ONE of the following categories.

Categories:

- chat
  General conversation, explanations, brainstorming, writing, summarization, translation, advice, Q&A, math, reasoning, emails, stories, or any request that does not require another specialized agent.

- search
  Requests that require searching the internet, finding recent information, current news, live data, websites, documentation, prices, products, or online resources.

- pdf
  Requests to analyze, summarize, extract information from, answer questions about, create, or modify PDF documents.

- ppt
  Requests to create, edit, improve, or generate PowerPoint presentations or slide decks.

- vision
  Requests involving images, including image generation, image editing, image analysis, OCR, describing images, screenshots, diagrams, or visual content.

- coding
  Requests involving programming, debugging, code generation, APIs, software architecture, algorithms, databases, DevOps, or technical implementation.

Rules:
1. Return EXACTLY ONE word.
2. Return ONLY one of:
   chat
   search
   pdf
   ppt
   vision
   coding
3. Do not explain your decision.
4. Do not add punctuation.
5. If uncertain, return chat.`

const response = await llm.invoke([
     {
          role:"system",
          content:systemPrompt
     },
     {
          role:"human",
          content:state.prompt
     }
])

return {
     ...state,
     agent: response.content.toLowerCase().trim()
}
     } catch (error) {
        console.error("❌ Router agent error:", error)
        throw error
    }
}