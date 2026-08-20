import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    title:{
        type:String,
        default:"New Chat"
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message:[
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Message"
            }
          ],    
    }
,{timestamps:true})


const Conversation = mongoose.model("Conversation",ConversationSchema)
export default Conversation