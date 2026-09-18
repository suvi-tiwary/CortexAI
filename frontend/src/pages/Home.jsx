import React from 'react'
import { auth, googleProvider } from '../config/firebase'
import { signInWithPopup } from 'firebase/auth'
import { FcGoogle } from "react-icons/fc";
import { Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import api from '../features/axios';
import { useDispatch, useSelector } from "react-redux"
import { setUserData } from '../redux/userSlice';
import Sidebar from '../components/Sidebar';
import ChatSection from '../components/ChatSection';
import Artifact from '../components/Artifact';

const Home = () => {
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user.userData)

  const googleLogin = async () => {
    let data = await signInWithPopup(auth, googleProvider)
    let token = await data.user.getIdToken()

    let result = await api.post("/auth/login", { token }, { withCredentials: true })
    dispatch(setUserData(result.data))
  }

  if (!userData) {
    return (
      <div className='relative min-h-screen w-full overflow-hidden bg-[#070b14] text-white'>
        <div
          className='absolute inset-0 opacity-90'
          style={{
            background: 'radial-gradient(circle at top left, rgba(168,85,247,0.24), transparent 28%), radial-gradient(circle at bottom right, rgba(59,130,246,0.16), transparent 24%)',
          }}
        />
        <div className='bg-grid absolute inset-0 opacity-25' />

        <div className='relative z-10 flex min-h-screen items-center justify-center px-4 py-10'>
          <div className='w-full max-w-5xl overflow-hidden rounded-4xl border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(15,23,42,0.75)] backdrop-blur-xl'>
            <div className='grid lg:grid-cols-[1.1fr_0.9fr]'>
              <div className='p-6 sm:p-8 lg:p-10'>
                <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium tracking-[0.2em] text-violet-200 uppercase'>
                  <Sparkles size={12} />
                  CortexAI
                </div>

                <h1 className='max-w-lg text-4xl font-black tracking-tight text-white sm:text-5xl'>Your AI workspace for building, researching, and shipping faster.</h1>
                <p className='mt-4 max-w-xl text-base text-slate-300 sm:text-lg'>Turn ideas into polished experiences with search, code generation, artifact previews, and multi-agent workflows—all in one sleek workspace.</p>

                <div className='mt-8 grid gap-3 sm:grid-cols-3'>
                  {[
                    { icon: Zap, label: 'Fast workflows' },
                    { icon: ShieldCheck, label: 'Secure access' },
                    { icon: Sparkles, label: 'AI-generated artifacts' }
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className='rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-200'>
                      <Icon className='mb-2 h-4 w-4 text-violet-300' />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex items-center justify-center bg-slate-950/70 p-6 sm:p-8 lg:p-10'>
                <div className='w-full max-w-md rounded-3xl border border-white/10 bg-[#111827]/80 p-6 shadow-2xl shadow-violet-950/30'>
                  <div className='mb-6'>
                    <p className='text-xs uppercase tracking-[0.25em] text-slate-400'>Welcome back</p>
                    <h2 className='mt-3 text-2xl font-bold text-white'>Sign in to continue</h2>
                  </div>

                  <button
                    onClick={googleLogin}
                    className='group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-base font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(255,255,255,0.18)] active:scale-[0.99]'
                  >
                    <FcGoogle size={22} />
                    <span>Continue with Google</span>
                    <ArrowRight size={16} className='opacity-70 transition-transform group-hover:translate-x-1' />
                  </button>

                  <div className='mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-slate-300'>
                    Smart chat, instant code previews, and output artifacts designed for product teams and creators.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='h-screen w-full overflow-hidden bg-[#070b14] text-white'>
      <div className='flex h-full w-full'>
        <Sidebar />
        <ChatSection />
        <Artifact />
      </div>
    </div>
  )
}

export default Home
