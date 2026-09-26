import multer from "multer"
import { mkdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { randomUUID } from "node:crypto"

export const uploadsDirectory = fileURLToPath(new URL("../public/uploads/", import.meta.url))
mkdirSync(uploadsDirectory, { recursive: true })

const storage = multer.diskStorage({
    destination: uploadsDirectory,
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase()
        callback(null, `${randomUUID()}${extension}`)
    }
})

const upload = multer({
    storage,
    limits: { fileSize: 15 * 1024 * 1024, files: 3 },
    fileFilter: (req, file, callback) => {
        const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
        callback(allowedTypes.includes(file.mimetype) ? null : new Error("Upload a PDF or PowerPoint (.pptx) file."), allowedTypes.includes(file.mimetype))
    }
})

export default upload