import Conversation from "../models/ConversationModel.js"
import Message from "../models/MessageModel.js"

export const createConversation = async(req,res)=>{
    try {
        const userId = req.user.userId
        const conversation = await Conversation.create({
            userId,
            title: 'New chat',
            message: []
        })

        return res.status(201).send(conversation)
    } catch (error) {
        return res.status(500).send(`create conversation error ${error}`)
    }
}

export const updateConversation = async(req,res)=>{
    try {
        let {conversationId,title,message}=req.body
        let conversation = await Conversation.findByIdAndUpdate(conversationId,{
            title,
            message
        },{new:true})

        return res.status(200).send(conversation)
    } catch (error) {
        return res.status(500).send(`update conversation error ${error}`)
    }
}

export const getConversations = async(req,res)=>{
    try {
        const userId=req.user.userId
        const conversations = await Conversation.find({userId}).sort({updatedAt:-1})
        return res.status(200).send(conversations)
    } catch (error) {
        return res.status(500).send(`get conversations error ${error}`)
    }
}

export const saveMessage = async(req,res)=>{
    try {
        let {conversationId,role,content,images,Artificate}=req.body
        const message = await Message.create({
            role,
            content,
            conversationId,
            images,
            Artificate: Artificate || []
        })

        return res.status(200).send(message)
    } catch (error) {
        return res.status(500).send(`save message error ${error}`)
    }
}

export const getMessages = async(req,res)=>{
    try {
        const {conversationId} = req.params
        const messages= await Message.find({conversationId})
        return res.status(200).send(messages)
    } catch (error) {
        return res.status(500).send(`get message error ${error}`)
    }
}

