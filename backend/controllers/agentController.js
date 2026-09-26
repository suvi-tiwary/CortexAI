import Message from "../models/MessageModel.js"
import Conversation from "../models/ConversationModel.js"
import { graph } from "../graph/graph.js"
import { addMessage } from "../config/memory.js";
import { generateTitle } from "../config/generateTitle.js";
import pdfParse from "pdf-parse";
import { readFile } from "node:fs/promises";


export const agent = async (req, res) => {
    try {
       
        const { conversationId, mode = "auto" } = req.body;
        const uploads = req.files || [];
        const prompt = req.body.prompt?.trim() || (uploads.length ? "Please analyze the uploaded document." : "");
        if (!prompt) return res.status(400).send({ error: "Enter a message or attach a PDF or PowerPoint file." });

        const uploadedFiles = uploads.map((file) => ({
            name: file.originalname,
            url: `/uploads/${encodeURIComponent(file.filename)}`,
            type: file.mimetype === "application/pdf" ? "pdf" : "ppt"
        }));
        const pdfFiles = uploads.filter((file) => file.mimetype === "application/pdf");
        const documentText = (await Promise.all(pdfFiles.map(async (file) => {
            const parsed = await pdfParse(await readFile(file.path));
            return parsed.text;
        }))).filter(Boolean).join("\n\n").slice(0, 50000);
        const template = uploads.find((file) => file.mimetype === "application/vnd.openxmlformats-officedocument.presentationml.presentation");

        const message = await Message.create({
            role: "user",
            content: prompt,
            conversationId,
            files: uploadedFiles
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
            mode,
            documentText,
            templatePath: template?.path,
            templateName: template?.originalname
        });

        const artifacts = result.artifact
            ? (Array.isArray(result.artifact) ? result.artifact : [result.artifact])
            : [];

        const aiMessage = await Message.create({
            role: "ai",
            content: result.ai,
            conversationId,
            images:result.images,
            artifacts,
            files: result.files || []
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
            artifacts,
            files: result.files || [],
            userFiles: uploadedFiles
        });

    } catch (error) {
        console.log(`agent controller error ${error}`)
        return res.status(500).send({ error: error.message || "The request could not be completed." });
    }
};
