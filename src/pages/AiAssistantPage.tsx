import { useState, useRef, useEffect } from 'react'
import { trpc } from '@/providers/trpc'
import { Brain, Send, User, Loader, Sparkles } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Welcome to Nexus AI Assistant. I'm here to help you with your gaming cafe operations. I can help with station management, inventory tracking, revenue analysis, pricing strategies, and more. What would you like to know?",
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ])
    },
  })

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setInput('')

    const conversationMessages = messages
      .concat({ role: 'user' as const, content: userMessage })
      .slice(-10)

    chatMutation.mutate({
      messages: conversationMessages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const suggestedQuestions = [
    'How do I optimize station pricing?',
    'What are the best-selling snacks?',
    'How to reduce idle station time?',
    'Tips for increasing revenue?',
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="px-6 lg:px-12 pt-6 pb-4 shrink-0">
        <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
          AI Assistant
        </div>
        <div className="text-2xl font-black text-[#F9F9F9] mt-1 flex items-center gap-3">
          <Sparkles size={24} className="text-[#0024A7]" />
          NEXUS AI
        </div>
        <div className="text-xs text-[#8A8A8A] mt-1 max-w-lg">
          Your intelligent gaming cafe advisor. Ask about operations, pricing, inventory, or anything related to managing your cafe.
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 lg:px-12 pb-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 shrink-0 flex items-center justify-center ${
                  msg.role === 'assistant'
                    ? 'bg-[#0024A7]/20'
                    : 'bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Brain size={14} className="text-[#0024A7]" />
                ) : (
                  <User size={14} className="text-[#8A8A8A]" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-4 text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9]'
                    : 'bg-[#0024A7]/10 border border-[#0024A7]/20 text-[#F9F9F9]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-[#0024A7]/20">
                <Brain size={14} className="text-[#0024A7]" />
              </div>
              <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-4">
                <div className="flex items-center gap-2 text-[#8A8A8A]">
                  <Loader size={14} className="animate-spin" />
                  <span className="text-xs font-mono-tech">PROCESSING...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-6 lg:px-12 pb-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="text-[10px] font-bold text-[#8A8A8A] uppercase mb-2">
              Suggested Questions
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setMessages((prev) => [...prev, { role: 'user', content: q }])
                    chatMutation.mutate({
                      messages: [
                        ...messages.slice(-5).map((m) => ({
                          role: m.role as 'user' | 'assistant',
                          content: m.content,
                        })),
                        { role: 'user' as const, content: q },
                      ],
                    })
                  }}
                  className="px-3 py-2 bg-[#101010] border border-[rgba(255,255,255,0.1)] text-xs text-[#8A8A8A] hover:text-[#F9F9F9] hover:border-[#0024A7] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 lg:px-12 pb-6 pt-2 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your gaming cafe operations..."
              className="flex-1 bg-[#101010] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="px-4 py-3 bg-[#0024A7] text-white hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
