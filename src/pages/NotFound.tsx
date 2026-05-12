import { useNavigate } from 'react-router'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle size={48} className="text-[#8A8A8A] mx-auto mb-6" />
        <div className="text-6xl font-black text-[#F9F9F9] mb-4">404.</div>
        <div className="text-xs font-bold text-[#8A8A8A] uppercase tracking-widest mb-8">
          PAGE NOT FOUND
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0024A7] text-white text-xs font-bold hover:bg-[#1A3DFF] transition-colors"
        >
          <ArrowLeft size={12} />
          BACK TO DASHBOARD
        </button>
      </div>
    </div>
  )
}
