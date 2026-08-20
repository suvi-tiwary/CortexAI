import { TavilySearch } from "@langchain/tavily";

const searchTool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  apiKey: process.env.TAVILY_API_KEY,
  includeImages:false
});

export default searchTool