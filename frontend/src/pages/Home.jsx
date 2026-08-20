import React from 'react'
import { auth, googleProvider } from '../config/firebase'
import { signInWithPopup } from 'firebase/auth'
import { FcGoogle } from "react-icons/fc";
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
  
  // Not logged in — show centered login card
  if (!userData) {
    return (
      <div className='bg-linear-30 from-gray-800 to-white/5 h-screen text-white w-full flex justify-center items-center'>
        <div className='w-[340px] bg-[#13151c] p-5 flex flex-col my-2 rounded-2xl shadow-2xl'>
          <h2 className='text-white text-[17px] font-bold'>CortexAI</h2>
          <p className='text-gray-500'>Login to use the CortexAI agent</p>
          <button 
            onClick={googleLogin} 
            className="bg-white text-black rounded-lg h-12 w-full mt-4
              flex items-center justify-center gap-2
              transition-all duration-300
              hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]
              hover:scale-[1.02]
              active:scale-95"
          >  
            <FcGoogle size={20} />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    )
  }

  // Logged in — full layout (NO justify-center items-center here!)
  return (
    <div className='bg-[#0F172A] h-screen text-white w-full flex overflow-hidden'>
      <Sidebar />
      <ChatSection />
     <Artifact/>
    </div>
  )
}

export default Home