import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import {
  MessageSquare,
  Send,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

export default function ContactPage() {
  const { isAdmin } = useAuth()
  const utils = trpc.useUtils()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data: contacts } = trpc.contact.list.useQuery(undefined, {
    enabled: isAdmin,
  })

  const createMutation = trpc.contact.create.useMutation({
    onSuccess: () => {
      setSubmitted(true)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      utils.contact.list.invalidate()
    },
  })

  const markReadMutation = trpc.contact.markRead.useMutation({
    onSuccess: () => utils.contact.list.invalidate(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) return
    createMutation.mutate({ name, email, subject, message })
  }

  return (
    <div className="p-6 lg:p-12">
      <div className="mb-8">
        <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-wider">
          Contact
        </div>
        <div className="text-2xl font-black text-[#F9F9F9] mt-1">
          GET IN TOUCH
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        {/* Contact Info */}
        <div className="bg-[#101010] border border-[rgba(255,255,255,0.1)] p-6">
          <div className="text-xs font-bold text-[#F9F9F9] uppercase mb-6">
            Contact Information
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-[#0024A7] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#F9F9F9]">Location</div>
                <div className="text-xs text-[#8A8A8A] mt-1">
                  123 Gaming Boulevard<br />
                  Tech District, CA 90210
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={16} className="text-[#0024A7] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#F9F9F9]">Email</div>
                <div className="text-xs text-[#8A8A8A] mt-1">
                  admin@nexusgaming.cafe
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={16} className="text-[#0024A7] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#F9F9F9]">Operating Hours</div>
                <div className="text-xs text-[#8A8A8A] mt-1">
                  Mon-Fri: 10:00 - 02:00<br />
                  Sat-Sun: 24 Hours
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageSquare size={16} className="text-[#0024A7] mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#F9F9F9]">Support</div>
                <div className="text-xs text-[#8A8A8A] mt-1">
                  For technical support, use the form or contact us via email.
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Section - visible to admin */}
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.1)]">
              <div className="text-xs font-bold text-[#F9F9F9] uppercase mb-4">
                Background Jobs
              </div>
              <div className="text-[10px] text-[#8A8A8A] font-mono-tech">
                Jobs queue is active and processing tasks automatically.
              </div>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-[#101010] border border-[rgba(255,255,255,0.1)] p-6">
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <CheckCircle size={48} className="text-[#0024A7] mb-4" />
              <div className="text-lg font-bold text-[#F9F9F9] uppercase mb-2">
                Message Sent
              </div>
              <div className="text-xs text-[#8A8A8A] text-center max-w-sm mb-6">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </div>
              <button
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors"
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          ) : (
            <>
              <div className="text-xs font-bold text-[#F9F9F9] uppercase mb-6">
                Send Message
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors"
                    placeholder="Message subject"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#8A8A8A] mb-1.5 uppercase">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="w-full bg-[#050505] border border-[rgba(255,255,255,0.1)] text-[#F9F9F9] px-4 py-3 text-sm focus:border-[#0024A7] focus:outline-none transition-colors resize-none"
                    placeholder="Your message..."
                  />
                </div>

                {createMutation.isError && (
                  <div className="flex items-start gap-2 p-3 border border-[#ff4444]/30 bg-[#ff4444]/5">
                    <AlertTriangle size={14} className="text-[#ff4444] mt-0.5 shrink-0" />
                    <span className="text-xs text-[#ff4444]">
                      Failed to send message. Please try again.
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <span className="animate-pulse">SENDING...</span>
                  ) : (
                    <>
                      <Send size={12} />
                      SEND MESSAGE
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Admin - Submissions List */}
      {isAdmin && contacts && contacts.length > 0 && (
        <div className="mt-6 bg-[#101010] border border-[rgba(255,255,255,0.1)] p-6">
          <div className="text-xs font-bold text-[#F9F9F9] uppercase mb-6">
            Contact Submissions ({contacts.length})
          </div>

          <div className="border border-[rgba(255,255,255,0.1)]">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#050505] border-b border-[rgba(255,255,255,0.1)] text-[10px] font-bold text-[#8A8A8A] uppercase">
              <div className="col-span-2">Name</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-3">Subject</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
            </div>

            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`grid grid-cols-12 gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.05)] items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors ${
                  !contact.isRead ? 'bg-[#0024A7]/5' : ''
                }`}
              >
                <div className="col-span-2 text-xs font-bold text-[#F9F9F9]">
                  {contact.name}
                </div>
                <div className="col-span-3 text-xs font-mono-tech text-[#8A8A8A]">
                  {contact.email}
                </div>
                <div className="col-span-3 text-xs text-[#F9F9F9]">
                  {contact.subject}
                </div>
                <div className="col-span-2 text-[10px] font-mono-tech text-[#8A8A8A]">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  {contact.isRead ? (
                    <span className="text-[10px] font-bold text-[#8A8A8A] uppercase">
                      READ
                    </span>
                  ) : (
                    <button
                      onClick={() => markReadMutation.mutate(contact.id)}
                      className="text-[10px] font-bold text-[#0024A7] uppercase hover:underline"
                    >
                      MARK READ
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
