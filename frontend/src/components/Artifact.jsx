import React, { useState } from 'react'
import {Code2, Eye, PanelRightClose} from "lucide-react"
import { useSelector } from 'react-redux'
import { easeInOut, motion } from 'framer-motion'
import Editor from "@monaco-editor/react"

const Artifact = () => {
  const [collapse,setCollapse]=useState(false)
  const [tab,setTab]=useState("preview")
  const [activeFile,setActiveFile]=useState(0)
  
  const {message}= useSelector(state => state.message)
   const artifactMessage = [...message]
  .reverse()
  .find(message => message.role === "ai" && message.artifacts?.length)

const artifact = artifactMessage?.artifacts?.[0]
if (!artifact) return null

const file = artifact?.files[activeFile]
console.log(file)

const htmlFile = artifact?.files?.find(f=>f.name==="index.html")
const cssFile = artifact?.files?.find(f=>f.name==="style.css")
const jsFile = artifact?.files?.find(f=>f.name==="script.js")

const canPreview = Boolean(htmlFile)
const previewDoc=`<!DOCTYPE html>
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

 const detectLanguage = (filename)=>{
    const file = filename.toLowerCase()
    if(file.endsWith(".html")){
      return "html"
    }
     if(file.endsWith(".css")){
      return "css"
    }
     if(file.endsWith(".js")){
      return "javascript"
    }
     if(file.endsWith(".jsx")){
      return "javascript"
    }
     if(file.endsWith(".tsx")){
      return "typescript"
    }
     if(file.endsWith(".java")){
      return "java"
    }
     if(file.endsWith(".py")){
      return "python"
    }
     if(file.endsWith(".cpp")){
      return "cpp"
    }
 }
  return (
    <motion.div
    initial={{width:"350px"}}
    animate={{width:collapse?50:350}}
    transition={{duration:0.23,ease:easeInOut}}
    
    className=' flex-lg h-full border-1 border-white/[0.06] overflow-hidden shrink-0'>
      {!collapse ? <div className='flex flex-col h-full bg-[#0d0f14]'>
           <div className='h-14 px-4 border-b border-white/[0.06] flex items-center gap-3 shrink-0'> 
             <button className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0' onClick={()=>setCollapse(prev=>!prev)}>
             <PanelRightClose size={21}/>
             </button>
                              
             <div className='flex items-center gap-2 flex-1 min-w-0'>
                <div className='text-[14px] font-medium text-slate-200 truncate' >{artifact?.title} hello</div>

             </div>

         {canPreview &&  <div className='flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rouded-lg'>
             <button className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab==="code" ?"bg-indigo-500 text-white":"text-slate-500 hover:text-slate-200"}`} onClick={()=>setTab("code")}>
              <Code2 size={11}/>Code
             </button>

              <button className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab==="preview" ?"bg-indigo-500 text-white":"text-slate-500 hover:text-slate-200"}`} onClick={()=>setTab("preview")}>
              <Eye size={11}/>Preview
             </button>
             </div> }
            
           </div>

             <div className='h-auto text-white flex border-b border-white/[0.06] overflow-x-auto [scrollbar-width:none]:hidden shrink-0'>
            { tab==="code" && artifact?.files.map((f,index)=>(
              <button className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/[0.05] relative cursor-pointer bg-transparent ${activeFile==index?"text-indigo-400":'text-slate-500 hover:text-slate-300'}`} onClick={()=>setActiveFile(index)}>
                {f?.name}
                {activeFile===index && <div className='absolute bootom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t-full'>
                  
                  </div>}
              </button>
            ))}
             </div>


         <div className='flex-1 overflow-hidden'>
           {(tab=="preview" && canPreview ) ?<motion.div 
              initial={{opacity:0}}
              animate={{opacity:1}}
              transition={{duration:0.5}}
              className='w-full h-full'
              >
                <iframe title='preview' srcDoc={previewDoc} className='w-full h-full bg-white'/>
                
                </motion.div>
                :
                <motion.div 
              initial={{opacity:0}}
              animate={{opacity:1}}
              transition={{duration:0.5}}
              className='w-full h-full bg-white'
              >
                <Editor theme='vs-dark' language={detectLanguage(file?.name)} value={file?.content}
                options={{readOnly:true ,fontSize:12, wordWrap:"on",padding:{top:21}}}
                />
                </motion.div>
                }

         </div>
      </div>
      :
      <div className='flex flex-col h-full bg-[#0d0f14]'>
        <button className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0 m-2.5' onClick={()=>setCollapse(prev=>!prev)}>
             <PanelRightClose size={21}/>
             </button>

             <div className="flex items-center justify-center h-full w-full text-[14px] font-medium text-slate-200 tracking-widest uppercase whitespace-nowrap"
            style={{ writingMode: "vertical-lr" }}>{artifact?.title}</div>
      </div>}
     
    </motion.div>
  )
}

export default Artifact