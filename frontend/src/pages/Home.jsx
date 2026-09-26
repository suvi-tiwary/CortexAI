import { useState } from 'react'
import { auth, googleProvider } from '../config/firebase'
import { signInWithPopup } from 'firebase/auth'
import { FcGoogle } from "react-icons/fc";
import { ArrowRight } from 'lucide-react';
import api from '../features/axios';
import { useDispatch, useSelector } from "react-redux"
import { setUserData } from '../redux/userSlice';
import Sidebar from '../components/Sidebar';
import ChatSection from '../components/ChatSection';
import Artifact from '../components/Artifact';

const Home = () => {
  const [artifactVisible, setArtifactVisible] = useState(true)
  const [loginError, setLoginError] = useState("")
  const dispatch = useDispatch()
  const userData = useSelector((state) => state.user.userData)

  const googleLogin = async () => {
    try {
      setLoginError("")
      const data = await signInWithPopup(auth, googleProvider)
      const token = await data.user.getIdToken()
      const result = await api.post("/auth/login", { token }, { withCredentials: true })
      dispatch(setUserData(result.data))
    } catch (error) {
      setLoginError(error.response?.data?.error || "Sign in could not be completed. Please try again.")
    }
  }

  if (!userData) {
    return (
      <div className='grid min-h-screen w-full bg-[#f1f3ee] text-[#202c27] lg:grid-cols-[1.1fr_0.9fr]'>
        <section className='relative flex min-h-[52vh] flex-col justify-between overflow-hidden bg-[#1d332b] px-7 py-7 text-white sm:px-12 sm:py-10 lg:min-h-screen lg:px-16 lg:py-12'>
          <div className='bg-grid pointer-events-none absolute inset-0 opacity-20' />
          <div className='relative flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4e873] text-lg font-bold text-[#1d332b]'>c.</div>
            <div>
              <p className='text-sm font-semibold tracking-wide'>CortexAI</p>
              <p className='text-[10px] uppercase tracking-[0.18em] text-[#b2c1b8]'>Creative studio</p>
            </div>
          </div>

          <div className='relative my-12 lg:my-0'>
            <p className='mb-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4e873]'>A little room to think</p>
            <h1 className='display-type max-w-2xl text-5xl font-medium leading-[1.08] sm:text-6xl lg:text-7xl'>Good ideas <span className='text-[#d4e873]'>start somewhere.</span></h1>
            <div className='mt-8 h-px w-24 bg-[#d4e873]/60' />
          </div>

          <p className='relative text-xs text-[#b2c1b8]'>Make yourself at home.</p>
        </section>

        <section className='flex min-h-[48vh] items-center justify-center px-6 py-12 sm:px-12 lg:min-h-screen'>
          <div className='w-full max-w-sm'>
            <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-[#75817a]'>Your workspace is waiting</p>
            <h2 className='display-type mt-3 text-4xl font-semibold text-[#202c27]'>Welcome back.</h2>
            <p className='mt-3 text-sm leading-6 text-[#75817a]'>Sign in to pick up where you left off.</p>

            <button
              onClick={googleLogin}
              className='group mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-[#d5ddd5] bg-white px-4 py-3.5 text-sm font-semibold text-[#202c27] transition-colors hover:border-[#aab8ad] hover:bg-[#fbfcf9] active:scale-[0.99]'
            >
              <FcGoogle size={20} />
              <span>Continue with Google</span>
              <ArrowRight size={16} className='ml-auto text-[#d9634e] transition-transform group-hover:translate-x-1' />
            </button>
            {loginError && <p role='alert' className='mt-3 text-sm text-[#bd4f3c]'>{loginError}</p>}
            <p className='mt-5 text-xs text-[#87928a]'>Your account stays yours. Sign in securely with Google.</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className='h-screen w-full overflow-hidden bg-[#070b14] text-white'>
      <div className='flex h-full w-full'>
        <Sidebar />
        <ChatSection artifactVisible={artifactVisible} onToggleArtifact={() => setArtifactVisible((visible) => !visible)} />
        <Artifact visible={artifactVisible} onHide={() => setArtifactVisible(false)} />
      </div>
    </div>
  )
}

export default Home
