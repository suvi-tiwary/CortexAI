import { useState } from "react";
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
        className='fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1d332b] text-white shadow-lg shadow-black/15 lg:hidden'
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
        className={`fixed inset-y-0 left-0 z-40 flex w-[82vw] max-w-75 flex-col border-r border-white/8 bg-[#1d332b] text-white shadow-2xl shadow-black/20 transition-transform duration-300 lg:static lg:z-auto lg:w-66 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className='flex items-center justify-between gap-3 px-4 py-5 lg:px-5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4e873] text-lg font-bold text-[#1d332b]'>
              c.
            </div>
            <div>
              <h1 className='text-lg font-semibold tracking-tight text-white'>CortexAI</h1>
              <p className='text-[10px] uppercase tracking-[0.18em] text-[#b2c1b8]'>Creative studio</p>
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
            className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#d4e873] px-4 py-3 text-sm font-semibold text-[#1d332b] transition-colors hover:bg-[#e0f08e] active:scale-[0.99]'
          >
            <FiPlus size={16} />
            New Chat
          </button>
        </div>

        <div className='px-5 pb-2'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a8b7ad]'>Recent work</p>
        </div>

        <div className='custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4'>
          {conversations.length === 0 ? (
            <div className='rounded-xl border border-dashed border-white/15 p-4 text-sm text-[#b2c1b8]'>
              Your conversations will appear here.
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
                  className={`group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${active ? 'bg-white/10 text-white' : 'text-[#c2cec6] hover:bg-white/5 hover:text-white'}`}
                >
                  <FiMessageSquare
                    size={16}
                    className={`${active ? 'text-[#d4e873]' : 'text-[#97a99d] group-hover:text-[#d4e873]'}`}
                  />
                  <span className='truncate text-sm font-medium'>{conv.title || 'New Chat'}</span>
                </div>
              );
            })
          )}
        </div>

        <div className='border-t border-white/10 p-4'>
          <div className='flex items-center gap-2'>
            <button className='flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/4 p-2.5 text-left transition hover:bg-white/8'>
              <div className='flex h-9 w-9 items-center justify-center rounded-full bg-[#d9634e]'>
                <CgProfile size={18} className='text-white' />
              </div>
              <span className='truncate text-sm font-medium text-white/80'>{userData?.name || 'User'}</span>
            </button>

            <button onClick={handleLogout} aria-label='Sign out' title='Sign out' className='rounded-xl border border-white/10 p-3 text-[#c2cec6] transition hover:bg-white/10 hover:text-white'>
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;