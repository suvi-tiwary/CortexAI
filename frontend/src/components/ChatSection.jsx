import { useEffect, useRef, useState } from 'react';
import {
  Send,
  Bot,
  Code2,
  FileText,
  Image as ImageIcon,
  Search,
  Presentation,
  Zap,
  Mic,
  Paperclip,
  Sparkles,
  Wand2,
  ArrowUpRight,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';
import api from '../features/axios';
import { useDispatch, useSelector } from "react-redux"
import ChatBubble from './ChatBubble';
import { getMessages } from '../features/getMessgaes';
import { addConversation, setSelectedConversation } from '../redux/conversationSlice';
import { addMessage, updateMessageFiles } from "../redux/messageSlice";

const MODES = [
  { id: 'auto', label: 'Auto', icon: Zap },
  { id: 'chat', label: 'Chat', icon: Bot },
  { id: 'coding', label: 'Coding', icon: Code2 },
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'ppt', label: 'PPT', icon: Presentation },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'search', label: 'Search', icon: Search },
];

const QUICK_PROMPTS = [
  'Build a modern SaaS landing page',
  'Summarize this project and propose improvements',
  'Create a dashboard mockup with dark mode UI',
  'Generate a product launch announcement',
];

const ChatSection = ({ artifactVisible, onToggleArtifact }) => {
  const { selectedConversation } = useSelector((state) => state.conversation)
  const { message } = useSelector((state) => state.message)
  const [value, setValue] = useState("")
  const [activeMode, setActiveMode] = useState('auto')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [recording, setRecording] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const dispatch = useDispatch()
  const skipInitialFetch = useRef(false)

  const createConversation = async () => {
    const response = await api.get("/chat/create-conversation")
    dispatch(addConversation(response.data))
    dispatch(setSelectedConversation(response.data))
    skipInitialFetch.current = true
    return response.data
  }

  const sendMessage = async () => {
    if ((!value.trim() && selectedFiles.length === 0) || sending) return
    const prompt = value.trim() || "Please analyze the uploaded document."
    const filesToUpload = selectedFiles
    const clientId = crypto.randomUUID()
    setSending(true)
    setError("")
    try {
      let conversation = selectedConversation
      if (!conversation) conversation = await createConversation()

      dispatch(addMessage({
        clientId,
        role: 'user',
        content: prompt,
        files: filesToUpload.map((file) => ({
          name: file.name,
          type: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'ppt',
        })),
      }))
      setValue("")
      setSelectedFiles([])

      const formData = new FormData()
      formData.append("conversationId", conversation._id)
      formData.append("prompt", prompt)
      formData.append("mode", activeMode)
      filesToUpload.forEach((file) => formData.append("files", file))
      const result = await api.post("/agent", formData)
      dispatch(updateMessageFiles({ clientId, files: result.data.userFiles || [] }))
      dispatch(addMessage({
        role: "ai",
        content: result.data.answer,
        images: result.data.images,
        artifacts: result.data.artifacts,
        files: result.data.files,
      }))
    } catch (error) {
      setError(error.response?.data?.error || "Something went wrong. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const toggleVoiceInput = () => {
    if (recording) {
      recognitionRef.current?.stop()
      setRecording(false)
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.")
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = navigator.language || "en-US"
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(" ")
      setValue((current) => `${current}${current ? " " : ""}${transcript}`)
    }
    recognition.onerror = () => setError("Voice input stopped. Check microphone permission and try again.")
    recognition.onend = () => setRecording(false)
    recognitionRef.current = recognition
    setError("")
    setRecording(true)
    recognition.start()
  }

  useEffect(() => {
    if (!selectedConversation?._id) return
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false
      return
    }

    const messages = async () => {
      await getMessages(selectedConversation._id, dispatch)
    }
    messages()
  }, [selectedConversation?._id, dispatch])

  const bottomRef = useRef(null);
  useEffect(() => {
    requestAnimationFrame(() => {
      bottomRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "end"
      })
    })
  }, [message?.length])

  const handlePromptClick = (prompt) => setValue(prompt)

  return (
    <div className='relative flex h-screen flex-1 flex-col overflow-hidden bg-[#0b1020]'>
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-violet-600/15 blur-[120px]' />
        <div className='absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]' />
      </div>

      <div className='relative z-10 flex flex-1 flex-col overflow-hidden'>
        <header className='border-b border-white/10 bg-[#0b1020]/75 px-4 py-4 backdrop-blur-xl sm:px-5 lg:px-6'>
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-[10px] uppercase tracking-[0.30em] text-violet-200/70'>AI workspace</p>
              <h2 className='mt-1 text-lg font-semibold text-white sm:text-xl'>CortexAI</h2>
            </div>

            <div className='flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-violet-100'>
              <span className='h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]' />
              online
            </div>
            {message.some((item) => item.role === 'ai' && item.artifacts?.length > 0) && (
              <button
                onClick={onToggleArtifact}
                title={artifactVisible ? 'Hide artifact' : 'Show artifact'}
                aria-label={artifactVisible ? 'Hide artifact' : 'Show artifact'}
                className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white'
              >
                {artifactVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
          </div>

          <div className='mt-4 flex gap-2 overflow-x-auto pb-1 custom-scrollbar'>
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveMode(id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-medium transition-all ${activeMode === id ? 'border-violet-400/40 bg-violet-500/15 text-violet-100 shadow-[0_8px_24px_rgba(139,92,246,0.18)]' : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20 hover:text-white'}`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className='custom-scrollbar relative z-10 flex-1 overflow-y-auto'>
          {message.length === 0 ? (
            <div className='flex h-full flex-col items-center justify-center px-5 pb-10 pt-8 text-center'>
              <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[0_18px_40px_rgba(139,92,246,0.38)]'>
                <Sparkles className='h-7 w-7 text-white' />
              </div>

              <h1 className='text-3xl font-black tracking-tight text-white sm:text-4xl'>How can I help you today?</h1>
              <p className='mt-3 max-w-xl text-sm text-slate-400 sm:text-base'>Build, brainstorm, prototype, summarize, and generate polished outputs from a single AI workspace.</p>

              <div className='mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-2'>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handlePromptClick(prompt)}
                    className='rounded-2xl border border-white/10 bg-white/5 p-3 text-left text-sm text-slate-200 transition hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white'
                  >
                    <span className='flex items-center justify-between gap-3'>
                      <span>{prompt}</span>
                      <ArrowUpRight size={16} className='text-violet-300' />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='pb-6'>
              {message.map((mes, i) => (
                <div key={i}>
                  <ChatBubble
                    role={mes.role}
                    content={mes.content}
                    images={mes.images}
                    artifacts={mes.artifacts}
                    files={mes.files}
                  />
                </div>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className='relative border-t border-white/[0.08] bg-[#0b1020]/90 px-3 pb-4 pt-3 backdrop-blur-xl sm:px-5 lg:px-6'>
          <div className='mx-auto max-w-3xl'>
            <div className='relative group'>
              <div className='absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-violet-500/25 via-fuchsia-500/20 to-cyan-500/25 opacity-0 blur transition duration-500 group-focus-within:opacity-100' />
              <div className='relative flex items-end gap-2 rounded-3xl border border-white/10 bg-[#121a2e]/90 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-4'>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title='Attach a PDF or PowerPoint template'
                  aria-label='Attach a PDF or PowerPoint template'
                  className='mb-1 rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white'
                >
                  <Paperclip className='h-4 w-4 sm:h-5 sm:w-5' />
                </button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.pdf,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation'
                  multiple
                  className='hidden'
                  onChange={(event) => {
                    const files = Array.from(event.target.files || [])
                    setSelectedFiles((current) => [...current, ...files].slice(0, 3))
                    event.target.value = ''
                  }}
                />

                <textarea
                  onChange={(e) => setValue(e.target.value)}
                  value={value}
                  placeholder='Ask CortexAI anything...'
                  rows={1}
                  className='flex-1 resize-none bg-transparent px-1 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none sm:text-[15px]'
                  style={{ minHeight: '48px', maxHeight: '140px' }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                <button
                  onClick={toggleVoiceInput}
                  title={recording ? 'Stop voice input' : 'Start voice input'}
                  aria-label={recording ? 'Stop voice input' : 'Start voice input'}
                  className={`mb-1 rounded-xl p-2 transition ${recording ? 'bg-rose-500/15 text-rose-300' : 'text-slate-400 hover:bg-violet-500/10 hover:text-violet-200'}`}
                >
                  <Mic className='h-4 w-4 sm:h-5 sm:w-5' />
                </button>

                <button
                  onClick={sendMessage}
                  disabled={sending || (!value.trim() && selectedFiles.length === 0)}
                  className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition hover:-translate-y-0.5 hover:shadow-violet-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
                  aria-label='Send message'
                >
                  <Send className='h-4 w-4' />
                </button>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-2'>
                {selectedFiles.map((file, index) => (
                  <span key={`${file.name}-${index}`} className='flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200'>
                    <span className='max-w-56 truncate'>{file.name}</span>
                    <button onClick={() => setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`} className='text-slate-400 hover:text-white'><X size={13} /></button>
                  </span>
                ))}
              </div>
            )}
            {error && <p role='alert' className='mt-2 text-xs text-rose-300'>{error}</p>}

            <div className='mt-3 flex items-center justify-between gap-2 text-[10px] text-slate-500'>
              <div className='flex items-center gap-2'>
                <Wand2 size={12} className='text-violet-300' />
                <span>Smart mode: {activeMode}</span>
              </div>
              <span>CortexAI may make mistakes.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;