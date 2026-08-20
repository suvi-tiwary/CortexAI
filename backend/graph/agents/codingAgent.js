import { generateTitle } from "../../config/generateTitle.js"
import { getModel } from "../LLMS.js"


const cleanOutput = (content) => {

    if (!content) {
        return ""
    }

    let text = String(content).trim()

    const tick = String.fromCharCode(96)

    const tripleTick =
        tick +
        tick +
        tick

    text = text.replaceAll(tripleTick + "html", "")
    text = text.replaceAll(tripleTick + "css", "")
    text = text.replaceAll(tripleTick + "javascript", "")
    text = text.replaceAll(tripleTick + "js", "")
    text = text.replaceAll(tripleTick, "")

    return text.trim()
}


const generateFile = async (
    LLM,
    fileName,
    prompt,
    retryPrompt
) => {

    console.log("")
    console.log("======================================")
    console.log("GENERATING:", fileName)
    console.log("======================================")


    let response = await LLM.invoke(prompt)

    let content = cleanOutput(response.content)


    console.log(
        fileName,
        "length:",
        content.length
    )


    if (!content || content.length < 30) {

        console.log(
            fileName,
            "generation failed. Retrying..."
        )

        response = await LLM.invoke(retryPrompt)

        content = cleanOutput(response.content)

        console.log(
            fileName,
            "retry length:",
            content.length
        )
    }


    return content
}


export const codingAgent = async (state) => {

    const LLM = await getModel("coding")

    const indentLLM = await getModel("indent")


    // =========================================================
    // 1. INTENT CLASSIFICATION
    // =========================================================

    const indentPrompt = [
        "You are an intent classifier.",
        "",
        "Return ONLY one of these values:",
        "",
        "CODE GENERATION",
        "CODE REVIEW",
        "CODE EXPLANATION",
        "DEBUGGING",
        "OPTIMIZATION",
        "CONVERSION",
        "DOCUMENTATION",
        "",
        "RULES:",
        "",
        "Use CODE GENERATION only when the user asks to build",
        "a website, web application, UI, game, dashboard,",
        "frontend project, landing page, portfolio, or another",
        "project that requires UI files.",
        "",
        "Do not use CODE GENERATION for simple DSA questions.",
        "Do not use CODE GENERATION for simple programming questions.",
        "Do not use CODE GENERATION for explanations.",
        "",
        "User Request:",
        state.prompt
    ].join("\n")


    const indentRes =
        await indentLLM.invoke(indentPrompt)


    const indent =
        String(indentRes.content).trim()


    console.log("")
    console.log("======================================")
    console.log("INTENT:", indent)
    console.log("======================================")


    // =========================================================
    // 2. CODE GENERATION
    // =========================================================

    if (indent.includes("CODE GENERATION")) {


        // =====================================================
        // DESIGN PLANNER
        // =====================================================

        console.log("")
        console.log("======================================")
        console.log("STEP 1: DESIGN PLANNER")
        console.log("======================================")


        const designPrompt = [
            "You are a senior product designer and frontend architect.",
            "",
            "Analyze the user's request and create a detailed UI",
            "and product implementation plan.",
            "",
            "Do not write code.",
            "",
            "Do not write HTML.",
            "Do not write CSS.",
            "Do not write JavaScript.",
            "",
            "The goal is to create a real product-quality interface.",
            "",
            "Do NOT automatically create a generic:",
            "navbar + hero + three cards + footer.",
            "",
            "The interface must be designed around the actual product.",
            "",
            "Define:",
            "",
            "1. Product concept",
            "2. Target user",
            "3. Main user goal",
            "4. Primary action",
            "5. Main screen",
            "6. Layout structure",
            "7. Important UI sections",
            "8. Important components",
            "9. User interactions",
            "10. Visual style",
            "11. Color direction",
            "12. Typography direction",
            "13. Responsive behavior",
            "14. Loading state",
            "15. Empty state",
            "16. Success state",
            "17. Error state",
            "",
            "Make the product feel unique.",
            "",
            "Make it feel like something a real startup could launch.",
            "",
            "User Request:",
            state.prompt
        ].join("\n")


        const designRes =
            await LLM.invoke(designPrompt)


        const design =
            cleanOutput(designRes.content)


        console.log(
            "Design plan length:",
            design.length
        )


        // =====================================================
        // HTML
        // =====================================================

        const htmlPrompt = [
            "You are a senior frontend engineer.",
            "",
            "Generate ONLY index.html.",
            "",
            "Do not generate CSS.",
            "Do not generate JavaScript.",
            "Do not explain anything.",
            "",
            "Create the complete HTML structure for the product.",
            "",
            "The UI must feel like a real modern product.",
            "",
            "Do not create a generic beginner website.",
            "",
            "Do not automatically use:",
            "navbar + hero + three cards + footer.",
            "",
            "Use the actual product requirements to determine",
            "the layout.",
            "",
            "Use semantic HTML.",
            "Use accessible elements.",
            "Use meaningful class names.",
            "Use realistic content.",
            "",
            "Never use lorem ipsum.",
            "Never use fake placeholder content.",
            "",
            "Images:",
            "",
            "Use direct images.unsplash.com URLs when useful.",
            "Never use source.unsplash.com.",
            "Never use placeholder image URLs.",
            "Never use Markdown image syntax.",
            "Every image must have src and alt.",
            "",
            "Create all HTML elements required by the design.",
            "",
            "The HTML must work with style.css and script.js.",
            "",
            "Return ONLY HTML.",
            "",
            "DESIGN PLAN:",
            design,
            "",
            "USER REQUEST:",
            state.prompt
        ].join("\n")


        const htmlRetryPrompt = [
            "Generate the complete index.html again.",
            "",
            "The previous HTML response was incomplete.",
            "",
            "Return ONLY HTML.",
            "",
            "Do not generate CSS.",
            "Do not generate JavaScript.",
            "Do not explain anything.",
            "",
            "The result must be a polished product UI.",
            "",
            "Design Plan:",
            design,
            "",
            "User Request:",
            state.prompt
        ].join("\n")


        const html = await generateFile(
            LLM,
            "index.html",
            htmlPrompt,
            htmlRetryPrompt
        )


        // =====================================================
        // CSS
        // =====================================================

        const cssPrompt = [
            "You are a senior UI engineer and visual designer.",
            "",
            "Generate ONLY style.css.",
            "",
            "Do not generate HTML.",
            "Do not generate JavaScript.",
            "Do not explain anything.",
            "",
            "Create polished production-quality styling.",
            "",
            "The design must NOT look like a generic AI website.",
            "",
            "Create a strong visual identity.",
            "",
            "Use:",
            "",
            "Strong typography",
            "Intentional spacing",
            "Visual hierarchy",
            "Depth",
            "Subtle shadows",
            "Useful borders",
            "Responsive layouts",
            "Hover states",
            "Active states",
            "Focus states",
            "Useful animations",
            "Responsive navigation",
            "Mobile layouts",
            "",
            "Do not make every element a card.",
            "",
            "Do not overuse gradients.",
            "",
            "Do not overuse glassmorphism.",
            "",
            "Make the design specific to the requested product.",
            "",
            "Style every important element in the HTML.",
            "",
            "Return ONLY CSS.",
            "",
            "DESIGN PLAN:",
            design,
            "",
            "HTML:",
            html,
            "",
            "USER REQUEST:",
            state.prompt
        ].join("\n")


        const cssRetryPrompt = [
            "Generate the complete style.css again.",
            "",
            "The previous CSS response was incomplete.",
            "",
            "Return ONLY CSS.",
            "",
            "Do not generate HTML.",
            "Do not generate JavaScript.",
            "Do not explain anything.",
            "",
            "Create polished responsive styling.",
            "",
            "Design Plan:",
            design,
            "",
            "HTML:",
            html,
            "",
            "User Request:",
            state.prompt
        ].join("\n")


        const css = await generateFile(
            LLM,
            "style.css",
            cssPrompt,
            cssRetryPrompt
        )


        // =====================================================
        // JAVASCRIPT
        // =====================================================

        const jsPrompt = [
            "You are a senior JavaScript engineer.",
            "",
            "Generate ONLY script.js.",
            "",
            "Do not generate HTML.",
            "Do not generate CSS.",
            "Do not explain anything.",
            "",
            "Implement the complete application behavior.",
            "",
            "The website must feel interactive and alive.",
            "",
            "Implement meaningful interactions based on the product.",
            "",
            "Possible interactions when appropriate:",
            "",
            "Navigation",
            "Tabs",
            "Search",
            "Filtering",
            "Dropdowns",
            "Modals",
            "Forms",
            "Validation",
            "Toast messages",
            "Toggles",
            "Sliders",
            "Animations",
            "Loading states",
            "Success states",
            "Error states",
            "Game logic",
            "Score updates",
            "Reset functionality",
            "Dynamic content",
            "State management",
            "",
            "Do not create fake buttons.",
            "",
            "Buttons should perform useful actions.",
            "",
            "Use DOM APIs correctly.",
            "",
            "Check that elements exist before interacting with them.",
            "",
            "Do not use external libraries unless explicitly requested.",
            "",
            "Return ONLY JavaScript.",
            "",
            "DESIGN PLAN:",
            design,
            "",
            "HTML:",
            html,
            "",
            "CSS:",
            css,
            "",
            "USER REQUEST:",
            state.prompt
        ].join("\n")


        const jsRetryPrompt = [
            "Generate the complete script.js again.",
            "",
            "The previous JavaScript response was incomplete.",
            "",
            "Return ONLY JavaScript.",
            "",
            "Do not generate HTML.",
            "Do not generate CSS.",
            "Do not explain anything.",
            "",
            "Complete every function.",
            "Do not stop in the middle of a function.",
            "Do not leave unfinished code.",
            "",
            "Implement the actual product interactions.",
            "",
            "Design Plan:",
            design,
            "",
            "HTML:",
            html,
            "",
            "CSS:",
            css,
            "",
            "User Request:",
            state.prompt
        ].join("\n")


        const js = await generateFile(
            LLM,
            "script.js",
            jsPrompt,
            jsRetryPrompt
        )


        // =====================================================
        // VALIDATION
        // =====================================================

        console.log("")
        console.log("======================================")
        console.log("PROJECT VALIDATION")
        console.log("======================================")


        console.log(
            "HTML:",
            html.length,
            "characters"
        )

        console.log(
            "CSS:",
            css.length,
            "characters"
        )

        console.log(
            "JS:",
            js.length,
            "characters"
        )


        if (!html || html.length < 50) {

            console.error(
                "HTML generation failed."
            )

            return {
                ...state,
                ai: "HTML generation failed.",
                artifact: []
            }
        }


        if (!css || css.length < 50) {

            console.error(
                "CSS generation failed."
            )

            return {
                ...state,
                ai: "CSS generation failed.",
                artifact: []
            }
        }


        if (!js || js.length < 20) {

            console.error(
                "JavaScript generation failed."
            )

            return {
                ...state,
                ai: "JavaScript generation failed.",
                artifact: []
            }
        }


        // =====================================================
        // CREATE FILES IN BACKEND
        // =====================================================

        const files = [

            {
                name: "index.html",
                content: html
            },

            {
                name: "style.css",
                content: css
            },

            {
                name: "script.js",
                content: js
            }

        ]


        // =====================================================
        // TITLE
        // =====================================================

        const title =
            await generateTitle(state.prompt)


        // =====================================================
        // FINAL ARTIFACT
        // =====================================================

        return {

            ...state,
            ai: "code generated successfully",
            artifact: {
                id: Date.now(),
                type: "project",
                title,
                files

            }

        }
    }


    // =========================================================
    // NON CODE GENERATION
    // =========================================================

    else {

        const response = await LLM.invoke(
            [
                "The user request is:",
                "",
                state.prompt,
                "",
                "The detected intent is:",
                "",
                indent,
                "",
                "Return only markdown.",
                "",
                "Never generate project files.",
                "",
                "Use this structure:",
                "",
                "# Overview",
                "",
                "## Explanation",
                "",
                "## Problems",
                "",
                "## Improvements",
                "",
                "# Best practices",
                "",
                "User Request:",
                state.prompt
            ].join("\n")
        )


        return {

            ...state,
            ai: response.content,
            artifact: []

        }
    }
}