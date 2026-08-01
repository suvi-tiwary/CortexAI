import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv"
dotenv.config()

console.log(process.env.GROQ_API_KEY?.slice(0, 10));
const groq = new ChatGroq({
model: "openai/gpt-oss-120b",
temperature: 0,
apiKey: process.env.GROQ_API_KEY
});

export const getModel = async(agent)=>{
    switch (agent) {

        case "chat":
            return groq
        default:
            return groq

    }
}
