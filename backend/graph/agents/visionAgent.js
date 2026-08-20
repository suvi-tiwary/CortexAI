import uploadOnCloudinary from "../../config/cloudinary.js";
import { generateTitle } from "../../config/generateTitle.js";
import { getModel } from "../LLMS.js";
import axios from "axios"

export const visionAgent = async (state) => {
  try {
     const llm = await getModel("image")
     const res = await llm.invoke(`
You are an expert image-generation prompt engineer.

Convert the user's request into ONE precise prompt for an image generation model.

IMPORTANT:
- Preserve the user's requested subject, action, objects, and relationships EXACTLY.
- Do NOT change the requested action.
- Do NOT replace objects with similar objects.
- Clearly describe WHERE each subject is positioned.
- The main subject must be visually obvious.
- If the user says "dog sitting on the bonnet of a car", explicitly state:
  "a golden retriever physically sitting ON TOP OF the car's bonnet/hood"
- Make the spatial relationship unmistakable.
- Do not describe the dog merely standing beside, in front of, or near the car.
- Do not add unnecessary story elements.
- The requested action has the highest priority.

Style:
- photorealistic
- cinematic lighting
- professional photography
- realistic anatomy
- natural proportions
- detailed textures
- shallow depth of field
- high dynamic range
- beautiful cinematic color palette

Return ONLY the final image-generation prompt.

User request:
${state.prompt}
`);

   const prompt= res.content.trim()
   const imageGenerationUrl = `http://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`
   console.log(imageGenerationUrl)

        return {
          ...state,
          ai:await generateTitle(state.prompt),
          files:[
             {
                name: "generated-image.png",
                url:imageGenerationUrl,
                type: "image"
            }
          ]
        }

  } catch (error) {
    console.log(error)
  }
  
};