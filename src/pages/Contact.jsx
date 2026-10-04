import { useState } from "react"

const API_BASE = "https://ai-business-manager-2.onrender.com"

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    business: "",
    message: ""
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleChange = e => {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const submit = async e => {
    e.preventDefault()

    setLoading(true)
    setSubmitted(false)
    setError("")

    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to send your message."
        )
      }

      setSubmitted(true)

      setForm({
        name: "",
        email: "",
        business: "",
        message: ""
      })

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="public-site">

      <main>

        <section className="public-inner-hero">
          <div className="public-container">

            <span className="public-eyebrow">
              CONTACT
            </span>

            <h1>
              Let's talk about your business.
            </h1>

            <p>
              Tell us what you want to manage, automate or improve.
            </p>

          </div>
        </section>


        <section className="public-section">

          <div className="public-container public-contact-grid">

            <div className="public-contact-info">

              <span className="public-eyebrow">
                GET IN TOUCH
              </span>

              <h2>
                Have a question or a business requirement?
              </h2>

              <p>
                Use the form and we can discuss the workflow
                or customization you need.
              </p>


              <div className="public-contact-item">
                <span>✉️</span>

                <div>
                  <small>Email</small>
                  <strong>
                    letstalk@itsoft.com
                  </strong>
                </div>
              </div>


              <div className="public-contact-item">
                <span>📞</span>

                <div>
                  <small>Phone</small>
                  <strong>
                    +91 98828-31336
                  </strong>
                </div>
              </div>


              <div className="public-contact-item">
                <span>📍</span>

                <div>
                  <small>Location</small>
                  <strong>
                    India
                  </strong>
                </div>
              </div>

            </div>


            <form
              className="public-contact-form"
              onSubmit={submit}
            >

              {submitted && (
                <div className="public-success">
                  ✅ Thanks! Your message has been
                  received successfully.
                </div>
              )}


              {error && (
                <div className="public-error">
                  ❌ {error}
                </div>
              )}


              <label>
                Name

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />

              </label>


              <label>
                Email

                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  type="email"
                  placeholder="you@example.com"
                />

              </label>


              <label>
                Business

                <input
                  name="business"
                  value={form.business}
                  onChange={handleChange}
                  placeholder="Business name"
                />

              </label>


              <label>
                Message

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us what you need..."
                />

              </label>


              <button
                className="public-primary-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Sending..."
                  : "Send Message →"}
              </button>

            </form>

          </div>

        </section>

      </main>

    </div>
  )
}

export default Contact