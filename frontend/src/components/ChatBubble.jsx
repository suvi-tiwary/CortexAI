import { Children } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {Copy,Check} from "lucide-react"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatBubble = ({ role, content, images, artifacts,files }) => {

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
  return (
    <div 
      className={`flex my-3 px-5 ${isUser ? "justify-end" : "justify-start" }`}>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${isUser?"bg-violet-600 text-white rounded-tr-sm": " text-zinc-100" }`}>

        {isUser?<p className="whitespace-pre-wrap">
            {content}
          </p>
          :
          <ReactMarkdown remarkPlugins={[remarkGfm]}
          components={{
            h1:({children})=>(
              <h1 className="font-bold text-2xl mt-5 mb-3 text-red-500">{children}</h1>
             ),
             h2:({children})=>(
              <h2 className="font-semibold text-xl mt-4 mb-2">{children}</h2>
             ),
              h3:({children})=>(
              <h3 className="text-xl mt-4 mb-2">{children}</h3>
             ),
             p:({children})=>(
              <p className="mb-3 whitespace-pre-wrap break-words">{children}</p>
             ),
             ul:({children})=>(
              <ul className="list-disc pl-5 space-y-1 my-2 ">{children}</ul>
             ),
              ol:({children})=>(
              <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
             ),
             table:({children})=>(
              <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-white/10">{children}</table>
              </div>
             ),
             th:({children})=>(
              <th className="border border-white/10 bg-white/5 px-3 py-2 text-left">{children}</th>
             ),
              td:({children})=>(
              <td className="border border-white/10 px-3 py-2">{children}</td>
             ),

             code:({className,children})=>{
              const value = String(children).trim();
              if(!className){
                return <code className="px-1.5 py-0.5 rounded-xl bg-white/10 text-violet-500">{value}</code>
              }

              const language = className?.replace("language-","")
              return (
                <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
                  <div className=" flex justify-between bg-[#1b1d24] border-b border-white/10 ml-2 mr-2 p-1">
                  <span className=" uppercase text-sm text-slate-500">{language}</span>

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
            className="w-[430px] h-[290px] object-cover border border-white/10 cursor-zoom-in rounded-xl hover:opacity-90 transition"
          />
        );
      }

      if (file.type === "pdf") {
        return (
          <a
            key={index}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20"
          >
            📄 {file.name}
          </a>
        );
      }

      if (file.type === "ppt") {
        return (
          <a
            key={index}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20"
          >
            📊 {file.name}
          </a>
        );
      }

      return null;
    })}

  </div>
}


      </div>

      {lightbox && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-6">
        <button className="absolute top-5 right-5 text-white/80 hover:text-white w-[38px] h-[47px] p-3 bg-red-700 cursor-pointer" onClick={()=>setLightBox(null)}>
          x
        </button>
        <img src={lightbox} className="max-w-[90vw] max-h-[80vh] rounded-2xl border border-white/10 shadow-2xl object-contain"/>
        </div>}

    </div>
  )
}

export default ChatBubble;
















