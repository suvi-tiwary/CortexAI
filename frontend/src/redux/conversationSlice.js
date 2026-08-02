import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name:"user",
  initialState:{
    conversations:[],
    selectedConversation:null
  },
  reducers:{
      setConversations:(state,action)=>{
      state.conversations=action.payload
    },
      addConversation:(state,action)=>{
      state.conversations.unshift(action.payload)    // unshift is a array operation to put something on the start
    },
      setSelectedConversation:(state,action)=>{
      state.selectedConversation=action.payload
    },
    
  }
})

export const {setConversations,addConversation,setSelectedConversation} = conversationSlice.actions
export default conversationSlice.reducer;