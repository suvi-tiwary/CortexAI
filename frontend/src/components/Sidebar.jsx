import React from "react";
import { FaHamburger } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { FiLogOut, FiMessageSquare } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import { addConversation, setSelectedConversation } from "../redux/conversationSlice";
import { setUserData } from "../redux/userSlice";
import api from "../features/axios";

const Sidebar = () => {

  const dispatch = useDispatch();
  const {userData} = useSelector(state=>state.user)

  const {
    conversations = [],
    selectedConversation
  } = useSelector(state => state.conversation);


  const createConversation = async () => {
    try {
      const res = await api.get("/chat/create-conversation");

      dispatch(addConversation(res.data));
      dispatch(setSelectedConversation(res.data));

    } catch (error) {
      console.log("create conversation error", error);
    }
  };


  const handleLogout = async () => {
    try {
      await api.get("/auth/logout");
      dispatch(setUserData(null));

    } catch (error) {
      console.log("logout error", error);
    }
  };


  return (

    <aside className=" w-[280px] h-screen flex flex-col bg-[#09090f]/90 backdrop-blur-xl border-r border-white/[0.08] shadow-2xl shadow-black/40" >

      <div className="flex items-center gap-3 px-5 py-5">

        <FaHamburger size={22} className=" text-white cursor-pointer hover:text-violet-400 transition "/>
        <h1 className=" text-white text-xl font-bold tracking-tight">
          Cortex AI
        </h1>

      </div>

<div className="h-[1px] bg-white/10"/>

      <div className="p-4">
        <button onClick={createConversation} className=" w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r  from-violet-600  to-indigo-700
        hover:from-violet-500  hover:to-fuchsia-600 shadow-lg shadow-violet-500/20 transition-all active:scale-95 cursor-pointer">
          + New Chat
        </button>
      </div>

      <div className="px-5 mb-2">
        <p className=" text-[11px] uppercase tracking-widest  text-white/40 font-semibold ">
          Recent Conversations
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
      {
        conversations.map((conv)=>{
        const active = selectedConversation?._id === conv._id;
          return (
          <div key={conv._id} onClick={() => dispatch(setSelectedConversation(conv))} className={`  group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all 
          ${active? "bg-violet-500/15" : "hover:bg-white/[0.06]"}`}>
            <FiMessageSquare size={17} className={`transition-colors ${active?"text-violet-400":"text-white/50 group-hover:text-violet-400"}`}/>
            <span className="text-sm text-white/80 truncate font-semibold">
             {conv.title || "New Chat"}
           </span>

          </div>
          )

        })
      }
      </div>

      {/* Footer */}

      <div className=" p-4 border-t  border-white/10 ">
        <div className=" flex items-center gap-2 " >

          <button className=" flex items-center gap-3 flex-1 p-2 rounded-xl hover:bg-white/5 transition">
          <div className=" w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center">
              <CgProfile size={20} className="text-white"/>
          </div>
            <span className="  text-white/80 text-sm " >
              {userData.name}
            </span>
          </button>

          <button onClick={handleLogout} className="p-3 rounded-xl hover:bg-red-500/10 transition">
            <FiLogOut size={20} className=" text-red-400"/>
          </button>

        </div>
      </div>

      <style>{`

      .custom-scrollbar::-webkit-scrollbar {
        width:4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background:transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background:rgba(255,255,255,0.1);
        border-radius:10px;
      }
      `}</style>
    </aside>

  );
};


export default Sidebar;