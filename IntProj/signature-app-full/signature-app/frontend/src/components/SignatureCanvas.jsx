import { useRef, useEffect, useState } from 'react'

export default function SignatureCanvas({ onCapture }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [tab, setTab] = useState('draw')
  const [typedName, setTypedName] = useState('')
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#1a1510'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvasRef.current.width / rect.width),
      y: (clientY - rect.top) * (canvasRef.current.height / rect.height),
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    setDrawing(true)
    lastPos.current = getPos(e)
  }

  const draw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }

  const stopDraw = () => setDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const captureDrawn = () => {
    const canvas = canvasRef.current
    const data = canvas.toDataURL('image/png')
    onCapture(data)
  }

  const captureTyped = () => {
    if (!typedName.trim()) return
    const offCanvas = document.createElement('canvas')
    offCanvas.width = 400
    offCanvas.height = 120
    const ctx = offCanvas.getContext('2d')
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 400, 120)
    ctx.fillStyle = '#1a1510'
    ctx.font = '64px Fraunces, serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedName, 16, 60)
    onCapture(offCanvas.toDataURL('image/png'))
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-surface2 p-1 rounded-lg mb-3">
        {['draw', 'type'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${
              tab === t ? 'bg-surface3 text-cream' : 'text-muted'
            }`}
          >
            {t === 'draw' ? '✏️ Draw' : 'T Type'}
          </button>
        ))}
      </div>

      {/* Draw tab */}
      {tab === 'draw' && (
        <div>
          <canvas
            ref={canvasRef}
            width={280}
            height={140}
            className="w-full h-[140px] bg-surface2 border border-border2 rounded-lg cursor-crosshair block"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />
          <div className="flex gap-2 mt-2">
            <button className="btn btn-ghost btn-sm" onClick={clearCanvas}>
              Clear
            </button>
            <button className="btn btn-gold btn-sm flex-1" onClick={captureDrawn}>
              ✓ Use This Signature
            </button>
          </div>
        </div>
      )}

      {/* Type tab */}
      {tab === 'type' && (
        <div>
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Type your full name..."
            className="input mb-2"
          />
          {/* Preview */}
          <div className="bg-white rounded-md px-4 py-2 text-center min-h-[60px] flex items-center justify-center mb-2">
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: '2rem', color: '#1a1510' }}>
              {typedName || 'Your Name'}
            </span>
          </div>
          <button className="btn btn-gold btn-sm w-full" onClick={captureTyped}>
            ✓ Use This Signature
          </button>
        </div>
      )}
    </div>
  )
}
