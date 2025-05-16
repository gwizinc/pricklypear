import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { FiMic } from 'react-icons/fi'

interface ThreadMessageComposerProps {
  threadClosed: boolean
  onSendMessage: (message: string) => void
}

const ThreadMessageComposer: React.FC<ThreadMessageComposerProps> = ({
  threadClosed,
  onSendMessage,
}) => {
  const [message, setMessage] = useState('')
  const [isDictating, setIsDictating] = useState(false)
  const recognitionRef = useRef<any>(null)
  const initialTextRef = useRef<string>('')

  // @ts-expect-error window.SpeechRecognition may not exist on type
  const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const isSpeechSupported = Boolean(SpeechRecognition)

  const handleMicClick = () => {
    if (isDictating) {
      recognitionRef.current?.stop()
      return
    }
    if (!isSpeechSupported) {
      toast.error('Speech recognition is not supported in this browser.')
      return
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            interimTranscript += event.results[i][0].transcript
          }
          setMessage(initialTextRef.current + interimTranscript)
        }

        recognitionRef.current.onerror = () => {
          toast.error('Speech recognition error')
          setIsDictating(false)
        }

        recognitionRef.current.onend = () => {
          setIsDictating(false)
        }

        initialTextRef.current = message
        recognitionRef.current.start()
        setIsDictating(true)
      })
      .catch(() => {
        toast.error('Microphone permission denied')
      })
  }

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setMessage('')
    initialTextRef.current = ''
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (threadClosed) {
      recognitionRef.current?.stop()
    }
  }, [threadClosed])

  return (
    <div className="relative p-4 border-t border-gray-200">
      <div className="relative">
        <textarea
          className={`w-full px-3 py-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDictating ? 'caret-blue-600' : ''}`}
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          disabled={threadClosed}
        />
        {isDictating && (
          <FiMic className="absolute top-2 right-2 text-blue-600" size={16} />
        )}
      </div>
      <div className="flex items-center mt-2 space-x-2">
        {isSpeechSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={threadClosed}
            className={`p-2 rounded ${isDictating ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-500 disabled:opacity-50`}
          >
            <FiMic size={20} />
          </button>
        )}
        <button
          type="button"
          onClick={handleSend}
          disabled={threadClosed || !message.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ThreadMessageComposer
