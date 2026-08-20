import express from "express"
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser"
import authRouter from "./routers/authRoute.js"
import cors from "cors"
import connectDb from "./config/db.js"
import { protect } from "./middleware/auth.js"
import getCurrentUserRoute from "./routers/getCurrentUserRoute.js"
import chatRouter from "./routers/chatRoute.js"
import agentRouter from "./routers/agentRoute.js"


const app =express()
const port = 3000

app.use(cors({
    origin:"cortex-ai-steel.vercel.app",
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/auth",authRouter)
app.use("/",protect,getCurrentUserRoute)
app.use("/chat",protect,chatRouter)
app.use("/",protect,agentRouter)

app.listen(port,()=>{
    console.log(`server started at port ${port}`)
    connectDb()
})



