import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Copy,Check} from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import api from "../features/axios";

const ChatBubble = ({ role, content, images, files }) => {

  const isUser = role === "user";
  const [lightbox,setLightBox]=useState(null)
  const [copiedCode,setCopiedCode]=useState("")

  const copyCode = async(code)=>{
     await navigator.clipboard.writeText(code)
     setCopiedCode(code)
     setTimeout(()=>{
      setCopiedCode("")
     },2000)
  }
  const fileUrl = (url) => {
    if (!url) return ""
    try {
      return new URL(url, api.defaults.baseURL || window.location.origin).toString()
    } catch {
      return url
    }
  }
  return (
    <div 
      className={`flex my-3 px-5 ${isUser ? "justify-end" : "justify-start" }`}>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser ? "rounded-tr-sm bg-[#1d332b] text-white" : "text-[#28352e]"}`}>

        {isUser?<p className="whitespace-pre-wrap">
            {content}
          </p>
          :
          <ReactMarkdown remarkPlugins={[remarkGfm]}
          components={{
            h1:({children})=>(
              <h1 className="display-type mt-5 mb-3 text-2xl font-semibold text-[#1d332b]">{children}</h1>
             ),
             h2:({children})=>(
              <h2 className="mt-4 mb-2 text-xl font-semibold text-[#1d332b]">{children}</h2>
             ),
              h3:({children})=>(
              <h3 className="mt-4 mb-2 text-lg font-semibold text-[#34453b]">{children}</h3>
             ),
             p:({children})=>(
              <p className="mb-3 whitespace-pre-wrap wrap-break-word leading-7">{children}</p>
             ),
             ul:({children})=>(
              <ul className="list-disc pl-5 space-y-1 my-2 ">{children}</ul>
             ),
              ol:({children})=>(
              <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
             ),
             table:({children})=>(
              <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-[#dfe5de]">{children}</table>
              </div>
             ),
             th:({children})=>(
              <th className="border border-[#dfe5de] bg-[#f1f3ee] px-3 py-2 text-left">{children}</th>
             ),
              td:({children})=>(
              <td className="border border-[#dfe5de] px-3 py-2">{children}</td>
             ),

             code:({className,children})=>{
              const value = String(children).trim();
              if(!className){
                return <code className="rounded bg-[#e8eee5] px-1.5 py-0.5 text-[#315c48]">{value}</code>
              }

              const language = className?.replace("language-","")
              return (
                <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
                  <div className="ml-2 mr-2 flex justify-between border-b border-white/10 bg-[#1b1d24] p-1">
                  <span className="uppercase text-sm text-slate-400">{language}</span>

                  <button className="flex items-center gap-1 text-xs cursor-pointer" onClick={()=>copyCode(value)}>{copiedCode==value?<><Check/>Copied</>:<><Copy size={16}/>Copy</>}</button>
                </div>

                <SyntaxHighlighter language={language} style={oneDark} wrapLongLines showLineNumbers 
                customStyle={{
                  margin:0,
                  padding:"16px",
                  background:"#0d1117",
                  fontSize:"14px"


                }}>{value}</SyntaxHighlighter>
                </div>
               
              )  
             }

          }}
          >
            {content}
          </ReactMarkdown>
        }

        {
          images?.length > 0 &&
          <div className="mt-3 flex flex-wrap gap-3">
            {
              images?.map((img,index)=>(
                <img
                  key={index}
                  src={img}
                  onClick={()=>setLightBox(img)}
                  onError={(e)=>e.currentTarget.remove()}
                  className="w-40 h-28 object-cover border border-white/10 cursor-zoom-in rounded-xl hover:opacity-90 transition"
                />
              ))
            }
          </div>
        }

        {
  files?.length > 0 &&
  <div className="mt-3 flex flex-wrap gap-3">

    {files.map((file, index) => {

      if (file.type === "image") {
        return (
          <img
            key={index}
            src={file.url}
            alt={file.name}
            onClick={() => setLightBox(file.url)}
            className="h-[290px] w-[430px] rounded-xl border border-[#dfe5de] object-cover transition hover:opacity-90"
          />
        );
      }

      if (file.type === "pdf") {
        const href = fileUrl(file.url)
        return (
          href ? <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            download={file.name}
            className="rounded-lg border border-[#dfe5de] bg-white px-4 py-3 text-sm text-[#34453b] transition-colors hover:bg-[#f1f3ee]"
          >
            {file.name}
          </a> : <span key={index} className="rounded-lg border border-[#dfe5de] bg-white px-4 py-3 text-sm">{file.name}</span>
        );
      }

      if (file.type === "ppt") {
        const href = fileUrl(file.url)
        return (
          href ? <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            download={file.name}
            className="rounded-lg border border-[#dfe5de] bg-white px-4 py-3 text-sm text-[#34453b] transition-colors hover:bg-[#f1f3ee]"
          >
            {file.name}
          </a> : <span key={index} className="rounded-lg border border-[#dfe5de] bg-white px-4 py-3 text-sm">{file.name}</span>
        );
      }

      return null;
    })}

  </div>
}


      </div>

      {lightbox && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
        <button aria-label="Close preview" className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9634e] text-white hover:bg-[#c85340]" onClick={()=>setLightBox(null)}>
          ×
        </button>
        <img src={lightbox} className="max-w-[90vw] max-h-[80vh] rounded-2xl border border-white/10 shadow-2xl object-contain"/>
        </div>}

    </div>
  )
}

export default ChatBubble;
















