import groq from "../graph/LLMS.js";

export const generateTitle = async (prompt) => {
  const response = await groq.invoke(`
Generate a short chat title (3-6 words).

Rules:
- Return ONLY the title.
- Do not use quotes.
- Do not end with a period.
- Keep it concise.

User:
${prompt}
`);

  return response.content.trim();
};