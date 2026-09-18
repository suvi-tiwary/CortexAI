import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { FiLogOut, FiMessageSquare, FiPlus, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import { addConversation, setSelectedConversation } from "../redux/conversationSlice";
import { setUserData } from "../redux/userSlice";
import api from "../features/axios";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const { conversations = [], selectedConversation } = useSelector((state) => state.conversation);

  const createConversation = async () => {
    try {
      const res = await api.get("/chat/create-conversation");
      dispatch(addConversation(res.data));
      dispatch(setSelectedConversation(res.data));
      setMobileOpen(false);
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
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className='fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-white shadow-lg shadow-slate-950/30 backdrop-blur-lg lg:hidden'
        aria-label='Open sidebar'
      >
        <FaBars size={16} />
      </button>

      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className='fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden'
          aria-label='Close sidebar overlay'
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[82vw] max-w-[300px] flex-col border-r border-white/10 bg-[#090d18]/90 shadow-2xl shadow-black/40 backdrop-blur-2xl transition-transform duration-300 lg:static lg:z-auto lg:w-[280px] ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className='flex items-center justify-between gap-3 px-4 py-5 lg:px-5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-lg shadow-violet-500/30'>
              C
            </div>
            <div>
              <h1 className='text-lg font-bold tracking-tight text-white'>Cortex AI</h1>
              <p className='text-[10px] uppercase tracking-[0.25em] text-violet-200/70'>Workspace</p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className='rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:text-white lg:hidden'
            aria-label='Close menu'
          >
            <FiX size={16} />
          </button>
        </div>

        <div className='h-px bg-white/10' />

        <div className='p-4'>
          <button
            onClick={createConversation}
            className='flex w-full items-center justify-center gap-2 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-violet-500/30 active:scale-[0.99]'
          >
            <FiPlus size={16} />
            New Chat
          </button>
        </div>

        <div className='px-5 pb-2'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400'>Recent Conversations</p>
        </div>

        <div className='custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4'>
          {conversations.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400'>
              Start a new conversation to see it here.
            </div>
          ) : (
            conversations.map((conv) => {
              const active = selectedConversation?._id === conv._id;
              return (
                <div
                  key={conv._id}
                  onClick={() => {
                    dispatch(setSelectedConversation(conv));
                    setMobileOpen(false);
                  }}
                  className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition-all ${active ? 'bg-violet-500/15 text-violet-100 ring-1 ring-violet-400/25' : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'}`}
                >
                  <FiMessageSquare
                    size={16}
                    className={`${active ? 'text-violet-300' : 'text-slate-400 group-hover:text-violet-300'}`}
                  />
                  <span className='truncate text-sm font-medium'>{conv.title || 'New Chat'}</span>
                </div>
              );
            })
          )}
        </div>

        <div className='border-t border-white/10 p-4'>
          <div className='flex items-center gap-2'>
            <button className='flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-left transition hover:bg-white/[0.08]'>
              <div className='flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500'>
                <CgProfile size={18} className='text-white' />
              </div>
              <span className='truncate text-sm font-medium text-white/80'>{userData?.name || 'User'}</span>
            </button>

            <button onClick={handleLogout} className='rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-300 transition hover:bg-red-500/20'>
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;