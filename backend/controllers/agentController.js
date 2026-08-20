import Message from "../models/MessageModel.js"
import Conversation from "../models/ConversationModel.js"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js";
import { generateTitle } from "../config/generateTitle.js";


export const agent = async (req, res) => {
    try {
       
        const { prompt, conversationId } = req.body;

        const message = await Message.create({
            role: "user",
            content: prompt,
            conversationId,
        });
        
        const conversation = await Conversation.findById(conversationId);
         
           if (conversation.title == "New chat") {
               const title = await generateTitle(prompt);
                conversation.title=title
               await conversation.save();
      }
        if (conversationId) {
            await Conversation.findByIdAndUpdate(conversationId, {
           $push: { message: message._id }
          });
        }     
        
       await addMessage({conversationId,role:"user",content:prompt})

        const result = await graph.invoke({
            conversationId,
            prompt,
        });

        const aiMessage = await Message.create({
            role: "ai",
            content: result.ai,
            conversationId,
            images:result.images,
            artifacts:result.artifact || [],
            files:result.files
        });

        if (conversationId) {
             await Conversation.findByIdAndUpdate(conversationId, {
           $push: { message: aiMessage._id }
});
        }

        await addMessage({conversationId,role:"ai",content:result.ai})

        return res.status(200).send({
            answer:result.ai,
            images:result.images,
            artifacts:result.artifact,
            files:result.files
        });

    } catch (error) {
        console.log(`agent controller error ${error}`)
    }
};
