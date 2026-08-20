import { ChatGroq } from "@langchain/groq";
import { ChatOpenRouter } from "@langchain/openrouter";
import dotenv from "dotenv"
dotenv.config()

const groq = new ChatGroq({
model: "openai/gpt-oss-120b",
temperature: 0,
apiKey: process.env.GROQ_API_KEY
});

const openRouter = new ChatOpenRouter({
    model:"deepseek/deepseek-chat",
    temperature:0,
    maxTokens:2500
})


export const getModel = async(agent)=>{
    switch (agent) {

        case "chat":
            return groq
        case "coding":
            return openRouter  
        case "image":
            return groq      
        default:
            return groq

    }
}

export default groq
