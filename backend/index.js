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
import { fileURLToPath } from "node:url"


const app =express()
const port = process.env.PORT || 3000
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173"


app.use(cors({
    origin: (origin, callback) => {
        const isDevelopmentOrigin = origin && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        if (!origin || origin === frontendOrigin || isDevelopmentOrigin) {
            return callback(null, true)
        }
        return callback(new Error("Origin is not allowed by CORS."))
    },
    credentials:true
}));

app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static(fileURLToPath(new URL("./public/uploads/", import.meta.url))))
app.use("/generated", express.static(fileURLToPath(new URL("./public/generated/", import.meta.url))))

app.use("/auth",authRouter)
app.use("/",protect,getCurrentUserRoute)
app.use("/chat",protect,chatRouter)
app.use("/",protect,agentRouter)

app.listen(port,()=>{
    console.log(`server started at port ${port}`)
    connectDb()
})



