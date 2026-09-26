import AdmZip from "adm-zip"
import pptxgen from "pptxgenjs"
import { getModel } from "../LLMS.js"
import { createGeneratedFile } from "../../config/generatedFiles.js"

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
	"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
}[character]))

const defaultTheme = {
	accent: "D9634E",
	background: "FBFCF9",
	text: "202C27",
	headingFont: "Fraunces",
	bodyFont: "Aptos"
}

const getTemplateTheme = async (templatePath) => {
	if (!templatePath) return defaultTheme
	const archive = new AdmZip(templatePath)
	const theme = archive.getEntry("ppt/theme/theme1.xml")?.getData().toString("utf8") || ""
	const color = (name, fallback) => {
		const section = theme.match(new RegExp(`<a:${name}>([\\s\\S]*?)</a:${name}>`))?.[1]
		return section?.match(/(?:srgbClr val="|sysClr[^>]*lastClr=")([0-9A-Fa-f]{6})/)?.[1]?.toUpperCase() || fallback
	}
	const headingFont = theme.match(/<a:majorFont>[\s\S]*?<a:latin typeface="([^"]+)"/)?.[1]
	const bodyFont = theme.match(/<a:minorFont>[\s\S]*?<a:latin typeface="([^"]+)"/)?.[1]
	return {
		accent: color("accent1", defaultTheme.accent),
		background: color("lt1", defaultTheme.background),
		text: color("dk1", defaultTheme.text),
		headingFont: headingFont || defaultTheme.headingFont,
		bodyFont: bodyFont || defaultTheme.bodyFont
	}
}

const parseSlides = (content) => {
	const json = content.match(/\{[\s\S]*\}/)?.[0]
	if (!json) throw new Error("The presentation model did not return slide data.")
	const parsed = JSON.parse(json)
	if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) {
		throw new Error("The presentation model returned no slides.")
	}
	return {
		title: String(parsed.title || "Presentation").slice(0, 100),
		slides: parsed.slides.slice(0, 16).map((slide) => ({
			title: String(slide.title || "").slice(0, 140),
			subtitle: String(slide.subtitle || "").slice(0, 220),
			bullets: Array.isArray(slide.bullets) ? slide.bullets.slice(0, 6).map((bullet) => String(bullet).slice(0, 240)) : []
		}))
	}
}

const makePreview = (presentation, theme) => {
	const cards = presentation.slides.map((slide, index) => `
	  <section class="slide ${index === 0 ? "cover" : ""}">
		<p class="number">${String(index + 1).padStart(2, "0")}</p>
		<h2>${escapeHtml(slide.title)}</h2>
		${slide.subtitle ? `<p class="subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
		<ul>${slide.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
	  </section>`).join("")
	const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(presentation.title)}</title></head><body><main><h1>${escapeHtml(presentation.title)}</h1><div class="slides">${cards}</div></main></body></html>`
	const css = `:root{--accent:#${theme.accent};--ink:#${theme.text};--paper:#${theme.background};--head:"${theme.headingFont}",sans-serif;--body:"${theme.bodyFont}",sans-serif}*{box-sizing:border-box}body{margin:0;background:#e8eeeb;color:var(--ink);font-family:var(--body)}main{max-width:1100px;margin:auto;padding:32px}h1{font:700 32px var(--head);margin:0 0 24px}.slides{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:20px}.slide{aspect-ratio:16/9;background:var(--paper);padding:8% 9%;box-shadow:0 8px 28px #173b361a;border-top:8px solid var(--accent);overflow:hidden}.slide.cover{display:flex;flex-direction:column;justify-content:center}.number{color:var(--accent);font-size:12px;letter-spacing:2px}h2{font:700 28px var(--head);margin:8px 0 14px}.subtitle{font-size:16px;line-height:1.5}li{font-size:15px;line-height:1.45;margin:8px 0}@media(max-width:600px){main{padding:18px}.slide{aspect-ratio:auto;min-height:300px}h2{font-size:22px}}`
	return [{ name: "index.html", content: html }, { name: "style.css", content: css }]
}

export const pptAgent = async (state = {}) => {
	const model = await getModel("coding")
	const theme = await getTemplateTheme(state.templatePath)
	const themeDescription = state.templatePath
		? `Use this uploaded template's theme colors and typography: accent #${theme.accent}, background #${theme.background}, text #${theme.text}, heading font ${theme.headingFont}, body font ${theme.bodyFont}.`
		: "Use a distinctive professional theme with a restrained teal accent, strong typographic hierarchy, generous whitespace, and varied layouts."
	const response = await model.invoke([
		"You are an expert presentation writer and art director. Build a coherent, concise slide deck with specific useful content and visually varied slide layouts.",
		themeDescription,
		"Return ONLY valid JSON with this shape: {\"title\":\"...\",\"slides\":[{\"title\":\"...\",\"subtitle\":\"...\",\"bullets\":[\"...\"]}]}.",
		"Create 6-10 slides unless the request clearly needs fewer. Keep bullets concise, avoid filler and fabricated statistics, and make the first and final slides purposeful.",
		`USER REQUEST:\n${state.prompt}`
	].join("\n\n"))

	const presentation = parseSlides(String(response.content || ""))
	const deck = new pptxgen()
	deck.layout = "LAYOUT_WIDE"
	deck.author = "CortexAI"
	deck.subject = state.prompt
	deck.title = presentation.title
	deck.theme = {
		headFontFace: theme.headingFont,
		bodyFontFace: theme.bodyFont,
		lang: "en-US"
	}

	presentation.slides.forEach((item, index) => {
		const slide = deck.addSlide()
		slide.background = { color: theme.background }
		slide.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.16, line: { color: theme.accent }, fill: { color: theme.accent } })
		if (index === 0) {
			slide.addText(item.title || presentation.title, { x: 0.8, y: 1.5, w: 11.7, h: 1.2, fontFace: theme.headingFont, fontSize: 34, bold: true, color: theme.text, breakLine: false, valign: "mid" })
			if (item.subtitle) slide.addText(item.subtitle, { x: 0.85, y: 3, w: 10.8, h: 0.8, fontFace: theme.bodyFont, fontSize: 19, color: theme.accent, breakLine: false })
		} else {
			slide.addText(item.title, { x: 0.75, y: 0.55, w: 11.8, h: 0.7, fontFace: theme.headingFont, fontSize: 25, bold: true, color: theme.text, breakLine: false })
			if (item.subtitle) slide.addText(item.subtitle, { x: 0.8, y: 1.45, w: 11.5, h: 0.65, fontFace: theme.bodyFont, fontSize: 15, color: theme.accent, breakLine: false })
			if (item.bullets.length) slide.addText(item.bullets.map((text) => ({ text, options: { bullet: { indent: 18 }, hanging: 4, breakLine: true } })), {
				x: 1, y: item.subtitle ? 2.25 : 1.8, w: 11, h: 4.3, fontFace: theme.bodyFont, fontSize: 18, color: theme.text, paraSpaceAfterPt: 16, breakLine: false, valign: "mid", bullet: { indent: 18 }
			})
		}
		slide.addText(`${String(index + 1).padStart(2, "0")}  /  ${String(presentation.slides.length).padStart(2, "0")}`, { x: 10.7, y: 7.05, w: 1.8, h: 0.2, fontFace: theme.bodyFont, fontSize: 9, color: theme.accent, align: "right", margin: 0 })
	})

	const output = await createGeneratedFile("pptx")
	await deck.writeFile({ fileName: output.path })
	return {
		...state,
		ai: `Created a ${presentation.slides.length}-slide PowerPoint${state.templatePath ? ` using the uploaded ${state.templateName} theme` : " with a built-in theme"}.`,
		artifact: { id: Date.now(), type: "presentation", title: presentation.title, files: makePreview(presentation, theme) },
		files: [{ name: `${presentation.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "presentation"}.pptx`, url: output.url, type: "ppt" }]
	}
}
