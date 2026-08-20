import { configureStore } from '@reduxjs/toolkit'
import  userReducer  from '../redux/userSlice'
import conversationReducer from "./conversationSlice"
import messageReducer from "./messageSlice"


export default configureStore({
  reducer: {
    user:userReducer,
    conversation:conversationReducer,
    message:messageReducer,
  },
})