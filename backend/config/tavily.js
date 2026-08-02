import { TavilySearch } from "@langchain/tavily";

const Searchtool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  includeImages:true
});