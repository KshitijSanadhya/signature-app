import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../utils/auth'
import Spinner from '../components/Spinner'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const result = await register(form.email, form.full_name, form.password)
    setLoading(false)
    if (result.success) navigate('/dashboard')
    else setError(result.error)
  }

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* Left */}
      <div className="relative flex flex-col justify-center px-16 bg-[#1a1712] overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full bg-gold/5 -top-24 -left-24 pointer-events-none" />
        <div className="flex items-center gap-2 mb-12">
          <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center text-lg">✍️</div>
          <span className="font-display font-bold text-cream text-xl tracking-tight">SignFlow</span>
        </div>
        <h1 className="font-display text-4xl font-semibold text-cream leading-tight tracking-tight mb-4">
          Start signing<br />
          <em className="not-italic text-gold">smarter</em> today.
        </h1>
        <p className="text-sm text-muted max-w-sm leading-relaxed">
          Join teams using SignFlow to replace paper-based signing with secure, traceable digital workflows.
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center bg-surface px-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-cream tracking-tight mb-1">Create account</h2>
          <p className="text-sm text-muted mb-7">Free to start. No credit card required.</p>

          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="label">Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handle} placeholder="Jane Doe" className="input" required />
            </div>
            <div className="mb-4">
              <label className="label">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} placeholder="jane@company.com" className="input" required />
            </div>
            <div className="mb-2">
              <label className="label">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} placeholder="Min 8 characters" className="input" required />
            </div>

            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-gold w-full mt-5">
              {loading ? <Spinner /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-gold font-medium hover:text-gold2">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
