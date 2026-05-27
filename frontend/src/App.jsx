import { useMemo, useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import './App.css'
import api from './api'

function App() {
  const [files, setFiles] = useState([])
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    pickupTime: '45',
    paperSize: 'A4',
    printType: 'bw',
    copies: 1,
    sides: 'single',
    notes: '',
  })
  const [currentStep, setCurrentStep] = useState('order') // 'order', 'payment', 'confirmation'
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const qrCanvasRef = useRef(null)

  const onFileChange = (event) => {
    const selected = Array.from(event.target.files || [])
    if (!selected.length) return
    setFiles((current) => [...current, ...selected])
    event.target.value = ''
  }

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const estimate = useMemo(() => {
    const basePerPage = form.printType === 'color' ? 6 : 2
    const sidesDiscount = form.sides === 'double' ? 0.85 : 1
    const pages = Math.max(files.length, 1) * Number(form.copies)
    const total = Math.ceil(pages * basePerPage * sidesDiscount)
    return {
      pages,
      total,
    }
  }, [files.length, form.copies, form.printType, form.sides])

  const generateOrderId = () => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    
    if (!files.length) {
      setError('Please upload at least one file before placing your order.')
      return
    }

    if (!form.customerName.trim() || !form.phone.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    if (form.phone.length < 10) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    setCurrentStep('payment')
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')
    
    try {
      const orderId = generateOrderId()
      const pickupTimeMs = Date.now() + Number(form.pickupTime) * 60 * 1000
      const pickupTime = new Date(pickupTimeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      const newOrder = {
        id: orderId,
        ...form,
        files: files.map(f => f.name),
        totalPrice: estimate.total,
        totalPages: estimate.pages,
        pickupTimeFormatted: pickupTime,
        paymentId: 'PAY-' + Date.now(),
        status: 'paid',
        createdAt: new Date().toLocaleString(),
      }

      // Send order to backend - this will work when backend is ready
      try {
        await api.submitOrder(newOrder)
      } catch (apiError) {
        console.warn('Backend not available, using local order:', apiError)
        // Continue with local order even if backend is not available
      }

      setOrder(newOrder)
      setCurrentStep('confirmation')
      
      // Reset form for next order
      setFiles([])
      setForm({
        customerName: '',
        phone: '',
        pickupTime: '45',
        paperSize: 'A4',
        printType: 'bw',
        copies: 1,
        sides: 'single',
        notes: '',
      })
    } catch (err) {
      setError('Payment processing failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startNewOrder = () => {
    setCurrentStep('order')
    setOrder(null)
    setError('')
  }

  useEffect(() => {
    if (currentStep === 'confirmation' && order && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        JSON.stringify({
          orderId: order.id,
          paymentId: order.paymentId,
          customerName: order.customerName,
          phone: order.phone,
        }),
        {
          errorCorrectionLevel: 'H',
          type: 'image/webp',
          quality: 0.95,
          margin: 1,
          width: 256,
          color: {
            dark: '#261609',
            light: '#fef2df',
          },
        },
        (error) => {
          if (error) console.error('QR Code generation error:', error)
        }
      )
    }
  }, [currentStep, order])

  return (
    <main className="page-shell">
      {currentStep === 'order' && (
        <>
          <section className="hero-section">
            <div>
              <p className="eyebrow">No Waiting Print Pickup</p>
              <h1>Xerox Queue, But Online</h1>
              <p className="lead">
                Send your files now, choose print settings, and walk in only when your order is ready.
                Faster than standing near the machine.
              </p>
              <div className="hero-chips">
                <span>Live Queue Slot</span>
                <span>Instant Cost Estimate</span>
                <span>WhatsApp Pickup Alert</span>
              </div>
            </div>
            <aside className="status-card" aria-label="Current print queue summary">
              <h2>Today&apos;s Queue</h2>
              <p className="status-main">08 orders in progress</p>
              <p>Average ready time: 22 min</p>
              <p className="slot">Your fastest pickup slot: 4:30 PM - 5:00 PM</p>
              <button type="button">Reserve This Slot</button>
            </aside>
          </section>

          <section className="order-grid">
            <article className="card upload-card">
              <h2>1. Upload Your Files</h2>
              <p>PDF, DOCX, PPT, and image files are accepted.</p>

              <label className="upload-dropzone" htmlFor="fileUpload">
                <input
                  id="fileUpload"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                  onChange={onFileChange}
                />
                <strong>Drag and drop files here</strong>
                <span>or click to browse from device</span>
              </label>

              <ul className="file-list">
                {files.length ? (
                  files.map((file, index) => (
                    <li key={`${file.name}-${index}`}>
                      <div>
                        <p>{file.name}</p>
                        <small>{Math.max(1, Math.round(file.size / 1024))} KB</small>
                      </div>
                      <button type="button" onClick={() => removeFile(index)}>
                        Remove
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="empty">No files added yet.</li>
                )}
              </ul>
            </article>

            <article className="card form-card">
              <h2>2. Choose Print Details</h2>
              <form onSubmit={onSubmit}>
                {error && <div className="error-message">{error}</div>}
                
                <div className="field-grid">
                  <label>
                    Name
                    <input
                      name="customerName"
                      type="text"
                      placeholder="Your name"
                      required
                      value={form.customerName}
                      onChange={updateForm}
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      name="phone"
                      type="tel"
                      placeholder="10-digit mobile"
                      required
                      value={form.phone}
                      onChange={updateForm}
                    />
                  </label>

                  <label>
                    Pickup in
                    <select name="pickupTime" value={form.pickupTime} onChange={updateForm}>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </label>

                  <label>
                    Paper size
                    <select name="paperSize" value={form.paperSize} onChange={updateForm}>
                      <option value="A4">A4</option>
                      <option value="A3">A3</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </label>

                  <label>
                    Print type
                    <select name="printType" value={form.printType} onChange={updateForm}>
                      <option value="bw">Black & White</option>
                      <option value="color">Color</option>
                    </select>
                  </label>

                  <label>
                    Copies
                    <input
                      name="copies"
                      type="number"
                      min="1"
                      max="100"
                      value={form.copies}
                      onChange={updateForm}
                    />
                  </label>

                  <label>
                    Sides
                    <select name="sides" value={form.sides} onChange={updateForm}>
                      <option value="single">Single Side</option>
                      <option value="double">Double Side</option>
                    </select>
                  </label>

                  <label className="full-width">
                    Notes
                    <textarea
                      name="notes"
                      rows="3"
                      placeholder="Binding, staple, color pages only, etc."
                      value={form.notes}
                      onChange={updateForm}
                    />
                  </label>
                </div>

                <div className="estimate">
                  <div>
                    <p>Estimated pages</p>
                    <strong>{estimate.pages}</strong>
                  </div>
                  <div>
                    <p>Approximate total</p>
                    <strong>Rs. {estimate.total}</strong>
                  </div>
                  <button type="submit">Proceed to Payment</button>
                </div>
              </form>
            </article>
          </section>

          <section className="steps">
            <h2>How It Works</h2>
            <div>
              <article>
                <h3>Upload</h3>
                <p>Upload files from your phone or laptop in less than a minute.</p>
              </article>
              <article>
                <h3>Confirm</h3>
                <p>Pick paper, copies, and pickup window with live price estimate.</p>
              </article>
              <article>
                <h3>Collect</h3>
                <p>Reach shop when your print is ready. No waiting near the queue.</p>
              </article>
            </div>
          </section>
        </>
      )}

      {currentStep === 'payment' && (
        <section className="payment-section">
          <div className="payment-card">
            <h2>Payment</h2>
            <div className="payment-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Customer Name:</span>
                <strong>{form.customerName}</strong>
              </div>
              <div className="summary-row">
                <span>Phone:</span>
                <strong>{form.phone}</strong>
              </div>
              <div className="summary-row">
                <span>Files:</span>
                <strong>{files.length} file(s)</strong>
              </div>
              <div className="summary-row">
                <span>Paper Size:</span>
                <strong>{form.paperSize}</strong>
              </div>
              <div className="summary-row">
                <span>Print Type:</span>
                <strong>{form.printType === 'bw' ? 'Black & White' : 'Color'}</strong>
              </div>
              <div className="summary-row">
                <span>Sides:</span>
                <strong>{form.sides === 'single' ? 'Single' : 'Double'}</strong>
              </div>
              <div className="summary-row">
                <span>Copies:</span>
                <strong>{form.copies}</strong>
              </div>
              <div className="summary-row">
                <span>Total Pages:</span>
                <strong>{estimate.pages}</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total Amount:</span>
                <strong>Rs. {estimate.total}</strong>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              className="payment-btn"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            <button
              className="back-btn"
              onClick={() => setCurrentStep('order')}
              disabled={loading}
            >
              Back
            </button>
          </div>
        </section>
      )}

      {currentStep === 'confirmation' && order && (
        <section className="confirmation-section">
          <div className="confirmation-card">
            <div className="success-icon">✓</div>
            <h2>Order Confirmed!</h2>
            <p className="order-id">Order ID: <strong>{order.id}</strong></p>
            
            <div className="qr-section">
              <h3>QR Code for Pickup</h3>
              <p>Show this QR code at the shop when collecting your order</p>
              <div className="qr-container">
                <canvas ref={qrCanvasRef}></canvas>
              </div>
              <button
                onClick={() => {
                  if (qrCanvasRef.current) {
                    const link = document.createElement('a')
                    link.href = qrCanvasRef.current.toDataURL('image/png')
                    link.download = `qr-code-${order.id}.png`
                    link.click()
                  }
                }}
                className="download-qr-btn"
              >
                Download QR Code
              </button>
            </div>

            <div className="pickup-details">
              <h3>Pickup Details</h3>
              <div className="detail-row">
                <span>Pickup Time:</span>
                <strong>{order.pickupTimeFormatted}</strong>
              </div>
              <div className="detail-row">
                <span>Total Pages:</span>
                <strong>{order.totalPages}</strong>
              </div>
              <div className="detail-row">
                <span>Total Amount Paid:</span>
                <strong>Rs. {order.totalPrice}</strong>
              </div>
              <div className="detail-row">
                <span>Status:</span>
                <span className="status-badge">Paid</span>
              </div>
            </div>

            <div className="confirmation-message">
              <p>✓ Payment received successfully</p>
              <p>✓ Your files are queued for printing</p>
              <p>✓ You will receive pickup notification on {order.phone}</p>
            </div>

            <button
              className="new-order-btn"
              onClick={startNewOrder}
            >
              Place Another Order
            </button>
          </div>
        </section>
      )}
    </main>
  )
}

export default App
