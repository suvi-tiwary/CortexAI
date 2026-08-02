import express from "express"
import { agent } from "../controllers/agentController.js"
import { protect } from "../middleware/auth.js"

const agentRouter = express.Router()

agentRouter.post("/agent", protect, agent)
export default agentRouter
