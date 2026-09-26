import { mkdir } from "node:fs/promises"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"

export const generatedDirectory = fileURLToPath(new URL("../public/generated/", import.meta.url))

export const createGeneratedFile = async (extension) => {
    await mkdir(generatedDirectory, { recursive: true })
    const filename = `${randomUUID()}.${extension}`
    return {
        filename,
        path: fileURLToPath(new URL(`../public/generated/${filename}`, import.meta.url)),
        url: `/generated/${filename}`
    }
}