import { StateGraph } from "@langchain/langgraph";
import { agentState } from "./state.js";
import { routerAgent } from "./routerAgent.js";
import { chatAgent } from "./agents/chatAgent.js";
import { searchAgent } from "./agents/searchAgent.js";
import { codingAgent } from "./agents/codingAgent.js";
import { pdfAgent } from "./agents/pdfAgent.js";
import { pptAgent } from "./agents/pptAgent.js";
import { visionAgent } from "./agents/visionAgent.js";


const workflow = new StateGraph(agentState)

workflow.addNode("route",routerAgent)
workflow.addNode("chat",chatAgent)
workflow.addNode("search",searchAgent)
workflow.addNode("coding",codingAgent)
workflow.addNode("pdf",pdfAgent)
workflow.addNode("ppt",pptAgent)
workflow.addNode("vision",visionAgent)

workflow.addEdge("__start__","route")
workflow.addConditionalEdges("route",(state)=>{
    switch (state.agent) {
        case "chat":
            return "chat"
            
        case "search":
            return "search"
                  
        case "coding":
           return "coding"
            
        case "pdf":
            return "pdf"
            
        case "ppt":
            return "ppt"
              
        case "vision":
            return "vision"
            
        default:
            return "chat"
            
    }
},{
    "chat":"chat",
    "search":"search",
    "coding":"coding",
    "pdf":"pdf",
    "ppt":"ppt",
    "vision":"vision"
})


workflow.addEdge("chat","__end__")
workflow.addEdge("search","chat")
workflow.addEdge("coding","__end__")
workflow.addEdge("pdf","__end__")
workflow.addEdge("ppt","__end__")
workflow.addEdge("vision","__end__")

export const graph = workflow.compile()

