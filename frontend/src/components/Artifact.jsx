import { useState } from 'react'
import { Code2, Download, Eye, Maximize2, Minimize2, PanelRightClose } from "lucide-react"
import { useSelector } from 'react-redux'
import { easeInOut, motion } from 'framer-motion'
import Editor from "@monaco-editor/react"

const Artifact = ({ visible, onHide }) => {
  const [expanded, setExpanded] = useState(() => window.innerWidth < 1280)
  const [tab, setTab] = useState("preview")
  const [activeFile, setActiveFile] = useState(0)

  const { message } = useSelector((state) => state.message)
  const artifactMessage = [...message]
    .reverse()
    .find((message) => message.role === "ai" && message.artifacts?.length)

  const artifact = artifactMessage?.artifacts?.[0]
  if (!artifact || !visible) return null

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

  const downloadArtifact = async () => {
    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    artifact.files?.forEach((item) => zip.file(item.name, item.content || ""))
    const blob = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${(artifact.title || "artifact").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "artifact"}.zip`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.23, ease: easeInOut }}
      className={`${expanded ? 'fixed inset-3 z-50 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] shadow-2xl' : 'hidden h-full w-[min(460px,38vw)] xl:flex'} shrink-0 overflow-hidden border border-[#dfe5de] bg-[#fbfcf9]`}
    >
        <div className='flex h-full w-full flex-col'>
          <div className='flex h-14 shrink-0 items-center gap-3 border-b border-[#dfe5de] px-4'>
            <button
              title='Hide artifact'
              aria-label='Hide artifact'
              className='flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe5de] bg-white text-[#75817a] transition hover:text-[#202c27]'
              onClick={onHide}
            >
              <PanelRightClose size={18} />
            </button>

            <div className='min-w-0 flex-1'>
              <div className='truncate text-[14px] font-medium text-[#202c27]'>{artifact?.title || 'Generated artifact'}</div>
            </div>

            <button
              title={expanded ? 'Exit full view' : 'View full screen'}
              aria-label={expanded ? 'Exit full view' : 'View full screen'}
              className='flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe5de] text-[#75817a] transition hover:bg-white hover:text-[#202c27]'
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              title='Download artifact files'
              aria-label='Download artifact files'
              disabled={!artifact.files?.length}
              className='flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfe5de] text-[#75817a] transition hover:bg-white hover:text-[#202c27] disabled:cursor-not-allowed disabled:opacity-40'
              onClick={downloadArtifact}
            >
              <Download size={16} />
            </button>

            {canPreview && (
              <div className='flex items-center gap-1 rounded-lg border border-[#dfe5de] bg-white p-1'>
                <button
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${tab === "code" ? 'bg-[#1d332b] text-white' : 'text-[#75817a] hover:text-[#202c27]'}`}
                  onClick={() => setTab("code")}
                >
                  <span className='flex items-center gap-1'><Code2 size={11} />Code</span>
                </button>

                <button
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${tab === "preview" ? 'bg-[#1d332b] text-white' : 'text-[#75817a] hover:text-[#202c27]'}`}
                  onClick={() => setTab("preview")}
                >
                  <span className='flex items-center gap-1'><Eye size={11} />Preview</span>
                </button>
              </div>
            )}
          </div>

          {tab === "code" && artifact?.files?.length > 0 && (
            <div className='flex shrink-0 overflow-x-auto border-b border-[#dfe5de] text-[#34453b]'>
              {artifact.files.map((f, index) => (
                <button
                  key={f.name || index}
                  className={`relative cursor-pointer border-r border-[#e8ece7] bg-transparent px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition ${activeFile === index ? 'text-[#d9634e]' : 'text-[#75817a] hover:text-[#202c27]'}`}
                  onClick={() => setActiveFile(index)}
                >
                  {f?.name}
                  {activeFile === index && <div className='absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-[#d9634e]' />}
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
    </motion.aside>
  )
}

export default Artifact
