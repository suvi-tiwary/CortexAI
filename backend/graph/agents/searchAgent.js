import searchTool from "../../config/tavily.js";

export const searchAgent = async (state) => {
  try {

    console.log(state.agent);
    const result = await searchTool.invoke({
      query: state.prompt
    });


    const cleanedResults = result.results
      .slice(0, 3) // keep only top 3 results
      .map((item) => ({
        title: item.title,
        content: item.content.slice(0, 1000),
        url: item.url
      }));


    return {
      ...state,
      searchResults: cleanedResults,
      images: result?.images || []
    };
    
  } catch (error) {

    console.log(`search agent error ${error}`);

    return {
      ...state,
      searchResults: [],
      images: []
    };
  }
};