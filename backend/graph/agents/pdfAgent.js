import PDFDocument from "pdfkit"
import { getModel } from "../LLMS.js"
import { createGeneratedFile } from "../../config/generatedFiles.js"

const writePdf = async (filename, title, content) => new Promise((resolve, reject) => {
	const document = new PDFDocument({ margin: 56, size: "A4" })
	const chunks = []
	document.on("data", (chunk) => chunks.push(chunk))
	document.on("error", reject)
	document.on("end", async () => {
		try {
			const { writeFile } = await import("node:fs/promises")
			await writeFile(filename, Buffer.concat(chunks))
			resolve()
		} catch (error) {
			reject(error)
		}
	})
	document.fontSize(22).fillColor("#173b36").text(title, { paragraphGap: 14 })
	document.moveDown(0.5).fontSize(11).fillColor("#263238").text(content, {
		lineGap: 4,
		paragraphGap: 8
	})
	document.end()
})

export const pdfAgent = async (state = {}) => {
	const model = await getModel("coding")
	const source = String(state.documentText || "").slice(0, 50000)
	const response = await model.invoke([
		"You are a careful document analyst and PDF author.",
		source ? "Answer the user's request using the uploaded PDF. Distinguish source facts from inferences, and say when the document does not contain an answer." : "Create a useful, well-structured document that fulfills the user's request.",
		"Return clear Markdown without inventing citations or claiming access to pages you cannot identify.",
		source ? `\nUPLOADED PDF TEXT:\n${source}` : "",
		`\nUSER REQUEST:\n${state.prompt}`
	].join("\n"))

	const answer = String(response.content || "").trim()
	const shouldCreatePdf = !source || /\b(create|generate|export|download|make)\b.{0,50}\b(pdf|document|report)\b/i.test(state.prompt || "")
	let files = []

	if (shouldCreatePdf) {
		const title = (state.prompt || "Generated document").slice(0, 80)
		const output = await createGeneratedFile("pdf")
		await writePdf(output.path, title, answer)
		files = [{ name: `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "document"}.pdf`, url: output.url, type: "pdf" }]
	}

	return { ...state, ai: answer, artifact: [], files }
}
