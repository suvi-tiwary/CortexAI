import Message from "../models/MessageModel.js"
import Conversation from "../models/ConversationModel.js"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js";


export const agent = async (req, res) => {
    try {
        console.log("agent route hit")
        const { prompt, conversationId } = req.body;
        const message = await Message.create({
            role: "user",
            content: prompt,
            conversationId
        });

        if (conversationId) {
            await Conversation.findByIdAndUpdate(conversationId, {
           $push: { message: message._id }
          });
        }
        
        await addMessage({conversationId,role:"user",content:prompt})
       console.log("agent route hit2")
        const result = await graph.invoke({
            conversationId,
            prompt,
        });

        const aiMessage = await Message.create({
            role: "ai",
            content: result.ai,
            conversationId
        });

        if (conversationId) {
             await Conversation.findByIdAndUpdate(conversationId, {
           $push: { message: aiMessage._id }
});
        }

        await addMessage({conversationId,role:"ai",content:result.ai})

        return res.status(200).send(result.ai);

    } catch (error) {
          console.error(error);

    return res.status(500).json({
        message: error.message,
        stack: error.stack,
    });
    }
};