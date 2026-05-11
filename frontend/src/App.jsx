import { useMemo, useState } from 'react'
import './App.css'

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

  const onSubmit = (event) => {
    event.preventDefault()
    if (!files.length) {
      alert('Please upload at least one file before placing your order.')
      return
    }
    alert('Order placed. We will start printing and share pickup status on your phone.')
  }

  return (
    <main className="page-shell">
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
              <button type="submit">Place Print Order</button>
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
    </main>
  )
}

export default App
