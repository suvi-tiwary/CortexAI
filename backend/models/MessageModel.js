import mongoose from "mongoose";

const filesSchema = new mongoose.Schema({
   name:String,
   content:String
},{id:false})


const ArtificateSchema = new mongoose.Schema({
    id:Number,
    type:String,
    title:String,
    files:[filesSchema]
},{id:false})

const files = new mongoose.Schema({
     name:{type:String},
     url:{type:String},
     type:{
        type:String,
        enum:["image","pdf","ppt"]
     }
},{id:false})

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    role: {
        type: String,
        enum: ['user', 'ai', 'system'],
        default: 'user'
    },
    content: {
        type: String,
    },
    images:[String],
    artifacts:[ArtificateSchema],
    files:[files],
}, { timestamps: true })

const Message = mongoose.model("Message", MessageSchema)
export default Message