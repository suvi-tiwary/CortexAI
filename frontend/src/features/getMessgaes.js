
import { setMessage } from "../redux/messageSlice"
import api from "./axios"

export const getMessages = async(conversationId,dispatch)=>{
    try {
      const data = await api.get(`/chat/get-messages/${conversationId}`)
      const normalizedMessages = (data.data || []).map((message) => ({
        ...message,
        artifactId: message.artifactId || message.artifact?.[0]?.id || null,
        artifact: Array.isArray(message.artifact)
          ? message.artifact
          : message.artifact ? [message.artifact] : [],
      }))
      dispatch(setMessage(normalizedMessages))
      console.log(normalizedMessages)
    } catch (error) {
      console.log(`get messages error ${error}`)
    }
}