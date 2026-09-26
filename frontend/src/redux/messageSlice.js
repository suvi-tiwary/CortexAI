import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name:"message",
  initialState:{
    message:[],
    artifacts:[]
  },
  reducers:{
    setMessage:(state,action)=>{
      state.message=action.payload
    },
    addMessage:(state,action)=>{
            state.message.push(action.payload)
        },
    updateMessageFiles:(state,action)=>{
      const target = state.message.find((message)=>message.clientId===action.payload.clientId)
      if(target) target.files=action.payload.files
    },
  }
})

export const {setMessage,addMessage,updateMessageFiles,setArtifact} = messageSlice.actions
export default messageSlice.reducer;