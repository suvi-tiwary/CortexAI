import Message from "../models/MessageModel.js"
import Conversation from "../models/ConversationModel.js"
import { graph } from "../graph/graph.js"


export const agent = async (req, res) => {
    try {
        const { prompt, conversationId } = req.body;

        // Save user message
        console.log("2️⃣ Creating user message...");

        const message = await Message.create({
            role: "user",
            content: prompt,
            conversationId
        });

        // Append user message to conversation
        if (conversationId) {

            await Conversation.findByIdAndUpdate(
                conversationId,{
                    $push: {message: message._id }
                }
            );
        }

        const result = await graph.invoke({
            conversationId,
            prompt,
        });

        const aiMessage = await Message.create({
            role: "ai",
            content: result.ai,
            conversationId
        });

        // Append AI message
        if (conversationId) {
            console.log("🔟 Updating conversation with AI message...");

            await Conversation.findByIdAndUpdate(
                conversationId,
                {
                    $push: {
                        message: aiMessage._id
                    }
                }
            );
        }

        return res.status(200).send(result.ai);

    } catch (error) {
        return res.status.send(`agent controller error ${error}`)
    }
};