import React, { useEffect, useRef, useState } from 'react';
import { Send,  Bot,  User, Code2,  FileText,  Image as ImageIcon,  Search, Presentation,  Zap, Mic, Paperclip,ThumbsUp,ThumbsDown,Copy,RotateCcw
} from 'lucide-react';
import api from '../features/axios';
import { useDispatch, useSelector } from "react-redux"
import ChatBubble from './ChatBubble';
import { getMessages } from '../features/getMessgaes';
import { addMessage } from '../redux/messageSlice';
import { addConversation, setSelectedConversation } from '../redux/conversationSlice';


const MODES = [
  { id: 'auto', label: 'Auto', icon: Zap },
  { id: 'chat', label: 'Chat', icon: Bot },
  { id: 'coding', label: 'Coding', icon: Code2 },
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'ppt', label: 'PPT', icon: Presentation },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'search', label: 'Search', icon: Search },
];


const ChatSection = () => {
  const {selectedConversation} = useSelector(state=>state.conversation)
  const {message} = useSelector(state=>state.message)
  const [value,setValue]=useState("")
  const dispatch =useDispatch()
  const skipInitialFetch = useRef(false)

  const createConversation = async () => {
    const response = await api.get("/chat/create-conversation")
    dispatch(addConversation(response.data))
    dispatch(setSelectedConversation(response.data))
    skipInitialFetch.current = true
    return response.data
  }

  const sendMessage = async ()=>{
    if (!value.trim()) return

    let conversation = selectedConversation
    if (!conversation) {
      conversation = await createConversation()
    }

    const prompt = value
    dispatch(addMessage({ role: 'user', content: prompt }))
    setValue("")

    try {
      const result = await api.post("/agent",{
        conversationId: conversation._id,
        prompt,
      })
      dispatch(addMessage({ role: 'ai', content: result.data }))
      console.log(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    if (!selectedConversation?._id) return
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false
      return
    }

    const messages = async()=>{
      await getMessages(selectedConversation._id,dispatch)
    }
    messages()
  },[selectedConversation?._id, dispatch])
  

  const bottomRef = useRef(null);
   useEffect(()=>{
    requestAnimationFrame(()=>{
    bottomRef?.current.scrollIntoView({
      behavior:"smooth",
      block:"end"
    })
    })
   },[message?.length])
  return (
    <div className="flex-1 flex flex-col h-screen bg-[#0d0d12] relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
        
        {message.length==0 && <div className="flex flex-col items-center justify-center h-full px-6 pt-[-40px]">
          <div className="text-center max-w-2xl mx-auto -mt-16">
            <h1 className='text-4xl font-bold text-white mb-3 tracking-tight'>Cortext AI</h1>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
              How can I help you?
            </h1>
            <p className="text-zinc-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Ask me anything — code, ideas, explanations, or just a quick question.
            </p>

          </div>
        </div>}
        {message.map((mes, i) => (
        <div key={i}>
         <ChatBubble role={mes.role} content={mes.content} />
        </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* Input Area */}
      <div className="relative z-20 border-t border-white/[0.06] bg-[#0d0d12]/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-7">

          {/* Input Box */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
            <div className="
              relative flex items-end gap-2 bg-[#14141a] border border-white/[0.08] 
              rounded-2xl p-5 focus-within:border-violet-500/30 focus-within:bg-[#18181f] 
              transition-all duration-300 shadow-xl
            ">
              {/* Attachment Icon */}
              <button className="p-2 rounded-xl text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all duration-200 mb-0.5">
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Textarea */}
              <textarea
                onChange={(e)=>setValue(e.target.value)}
                value={value}
                placeholder="Ask CortexAI..."
                rows={1}
                className="
                  flex-1 bg-transparent text-zinc-200 placeholder-zinc-600 text-sm 
                  resize-none outline-none py-3 px-1 leading-relaxed
                "
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />

              {/* Mic Icon */}
              <button className="p-2 rounded-xl text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 transition-all duration-200 mb-0.5">
                <Mic className="w-5 h-5" />
              </button>

              {/* Send Button */}
              <button
                onClick={sendMessage}
                className="
                  flex-shrink-0 p-3 rounded-xl transition-all duration-300
                  bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white 
                  shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 
                  hover:scale-105 active:scale-95
                "
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-zinc-700 mt-3">
            CortexAI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>

     
    </div>
  );
};

export default ChatSection;