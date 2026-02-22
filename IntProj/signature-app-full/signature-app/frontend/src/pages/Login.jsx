import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import Spinner from '../components/Spinner'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) navigate('/dashboard')
    else setError(result.error)
  }

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* Left panel */}
      <div className="relative flex flex-col justify-center px-16 bg-[#1a1712] overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-gold/5 -top-24 -left-24 pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full bg-blue-400/5 -bottom-16 -right-16 pointer-events-none" />

        <div className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-lg">✍️</div>
          <span className="font-display font-bold text-cream text-xl tracking-tight">SignFlow</span>
        </div>

        <h1 className="font-display text-4xl font-semibold text-cream leading-tight tracking-tight mb-4">
          Documents signed.<br />
          <em className="not-italic text-gold">Legally.</em> Instantly.
        </h1>
        <p className="text-sm text-muted max-w-sm leading-relaxed mb-8">
          Upload any PDF, place signature fields, share a secure link, and get a signed, audit-ready document in minutes.
        </p>

        <div className="flex flex-col gap-2.5">
          {[
            'Drag-and-drop signature placement',
            'Immutable signed PDFs with full audit trail',
            'One-click signing links — no account needed for signers',
            'Compliance-ready event logging',
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-muted/80">
              <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center bg-surface px-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-cream tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm text-muted mb-7">Sign in to your SignFlow account</p>

          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="label">Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handle}
                placeholder="jane@company.com" className="input" required
              />
            </div>
            <div className="mb-2">
              <label className="label">Password</label>
              <input
                name="password" type="password" value={form.password} onChange={handle}
                placeholder="••••••••" className="input" required
              />
            </div>

            {error && <p className="text-red-400 text-xs mt-2 mb-1">{error}</p>}

            <button
              type="submit" disabled={loading}
              className="btn btn-gold w-full mt-4"
            >
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold font-medium hover:text-gold2">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
