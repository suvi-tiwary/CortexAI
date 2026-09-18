import React, { useState } from 'react'
import { Code2, Eye, PanelRightClose } from "lucide-react"
import { useSelector } from 'react-redux'
import { easeInOut, motion } from 'framer-motion'
import Editor from "@monaco-editor/react"

const Artifact = () => {
  const [collapse, setCollapse] = useState(false)
  const [tab, setTab] = useState("preview")
  const [activeFile, setActiveFile] = useState(0)

  const { message } = useSelector((state) => state.message)
  const artifactMessage = [...message]
    .reverse()
    .find((message) => message.role === "ai" && message.artifacts?.length)

  const artifact = artifactMessage?.artifacts?.[0]
  if (!artifact) return null

  const file = artifact?.files?.[activeFile]

  const htmlFile = artifact?.files?.find((f) => f.name === "index.html")
  const cssFile = artifact?.files?.find((f) => f.name === "style.css")
  const jsFile = artifact?.files?.find((f) => f.name === "script.js")

  const canPreview = Boolean(htmlFile)
  const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    ${cssFile?.content || ""}
  </style>
</head>
<body>
  ${htmlFile?.content || ""}
  <script>
    ${jsFile?.content || ""}
  </script>
</body>
</html>`

  const detectLanguage = (filename) => {
    const fileName = filename?.toLowerCase() || ''
    if (fileName.endsWith(".html")) return "html"
    if (fileName.endsWith(".css")) return "css"
    if (fileName.endsWith(".js") || fileName.endsWith(".jsx")) return "javascript"
    if (fileName.endsWith(".tsx")) return "typescript"
    if (fileName.endsWith(".java")) return "java"
    if (fileName.endsWith(".py")) return "python"
    if (fileName.endsWith(".cpp")) return "cpp"
    return "plaintext"
  }

  return (
    <motion.aside
      initial={{ width: "350px" }}
      animate={{ width: collapse ? 52 : 350 }}
      transition={{ duration: 0.23, ease: easeInOut }}
      className='hidden h-full shrink-0 overflow-hidden border-l border-white/6 bg-[#0d0f14] xl:flex'
    >
      {!collapse ? (
        <div className='flex h-full w-full flex-col'>
          <div className='flex h-14 shrink-0 items-center gap-3 border-b border-white/6 px-4'>
            <button
              className='flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-slate-400 transition hover:text-slate-200'
              onClick={() => setCollapse((prev) => !prev)}
            >
              <PanelRightClose size={18} />
            </button>

            <div className='min-w-0 flex-1'>
              <div className='truncate text-[14px] font-medium text-slate-200'>{artifact?.title || 'Generated artifact'}</div>
            </div>

            {canPreview && (
              <div className='flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 p-1'>
                <button
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${tab === "code" ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  onClick={() => setTab("code")}
                >
                  <span className='flex items-center gap-1'><Code2 size={11} />Code</span>
                </button>

                <button
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${tab === "preview" ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  onClick={() => setTab("preview")}
                >
                  <span className='flex items-center gap-1'><Eye size={11} />Preview</span>
                </button>
              </div>
            )}
          </div>

          {tab === "code" && artifact?.files?.length > 0 && (
            <div className='flex shrink-0 overflow-x-auto border-b border-white/6 text-white'>
              {artifact.files.map((f, index) => (
                <button
                  key={f.name || index}
                  className={`relative cursor-pointer border-r border-white/5 bg-transparent px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition ${activeFile === index ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                  onClick={() => setActiveFile(index)}
                >
                  {f?.name}
                  {activeFile === index && <div className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-indigo-500' />}
                </button>
              ))}
            </div>
          )}

          <div className='min-h-0 flex-1 overflow-hidden'>
            {tab === "preview" && canPreview ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className='h-full w-full'>
                <iframe title='preview' srcDoc={previewDoc} className='h-full w-full bg-white' />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className='h-full w-full bg-[#111827]'>
                <Editor
                  theme='vs-dark'
                  language={detectLanguage(file?.name)}
                  value={file?.content || ''}
                  options={{ readOnly: true, fontSize: 12, wordWrap: 'on', padding: { top: 21 } }}
                />
              </motion.div>
            )}
          </div>
        </div>
      ) : (
        <div className='flex h-full w-full flex-col bg-[#0d0f14]'>
          <button
            className='m-2.5 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-slate-400 transition hover:text-slate-200'
            onClick={() => setCollapse((prev) => !prev)}
          >
            <PanelRightClose size={18} />
          </button>

          <div className='flex h-full items-center justify-center text-[11px] font-medium uppercase tracking-[0.35em] text-slate-200 whitespace-nowrap' style={{ writingMode: 'vertical-lr' }}>
            {artifact?.title || 'Artifact'}
          </div>
        </div>
      )}
    </motion.aside>
  )
}

export default Artifact
