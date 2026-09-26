import express from "express"
import { agent } from "../controllers/agentController.js"
import { protect } from "../middleware/auth.js"
import upload from "../middleware/multer.js"

const agentRouter = express.Router()

agentRouter.post("/agent", protect, upload.array("files", 3), agent)
export default agentRouter
