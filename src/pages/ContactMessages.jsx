import { useEffect, useState } from "react"

const statuses = ["new", "read", "replied"]
const pageSize = 50

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  })
}

function ContactMessages({ apiRequest }) {
  const [messages, setMessages] = useState([])
  const [counts, setCounts] = useState({ total: 0, new: 0, read: 0, replied: 0 })
  const [totalMatching, setTotalMatching] = useState(0)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [offset, setOffset] = useState(0)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      const params = new URLSearchParams({
        limit: String(pageSize),
        offset: String(offset)
      })
      if (search.trim()) params.set("search", search.trim())
      if (statusFilter) params.set("status", statusFilter)

      setLoading(true)
      setError("")

      try {
        const result = await apiRequest(`/api/contact?${params}`, {
          signal: controller.signal
        })
        setMessages(result.items)
        setCounts(result.counts)
        setTotalMatching(result.total)
        if (offset > 0 && offset >= result.total) {
          setOffset(Math.max(0, offset - pageSize))
        }
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError.message || "Unable to load contact messages.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [apiRequest, offset, refreshVersion, search, statusFilter])

  const refreshMessages = () => setRefreshVersion(value => value + 1)

  const openMessage = async id => {
    setSelectedMessage(null)
    setDetailLoading(true)
    setError("")

    try {
      let message = await apiRequest(`/api/contact/${id}`)
      if (message.status === "new") {
        message = await apiRequest(`/api/contact/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "read" })
        })
        refreshMessages()
      }
      setSelectedMessage(message)
    } catch (requestError) {
      setError(requestError.message || "Unable to open this contact message.")
    } finally {
      setDetailLoading(false)
    }
  }

  const updateStatus = async (id, nextStatus) => {
    setUpdatingId(id)
    setError("")
    setNotice("")

    try {
      const updated = await apiRequest(`/api/contact/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus })
      })
      if (selectedMessage?.id === id) setSelectedMessage(updated)
      setNotice("Message status updated.")
      refreshMessages()
    } catch (requestError) {
      setError(requestError.message || "Unable to update message status.")
    } finally {
      setUpdatingId(null)
    }
  }

  const deleteMessage = async message => {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) {
      return
    }

    setDeletingId(message.id)
    setError("")
    setNotice("")

    try {
      await apiRequest(`/api/contact/${message.id}`, { method: "DELETE" })
      if (selectedMessage?.id === message.id) setSelectedMessage(null)
      setNotice("Contact message deleted.")
      refreshMessages()
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this contact message.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page contact-messages-page">
      <div className="contact-messages-heading">
        <div>
          <p className="eyebrow">WEBSITE ENQUIRIES</p>
          <h1>Contact Messages</h1>
          <p>Manage enquiries submitted through your website</p>
        </div>
        <button
          className="contact-refresh-button"
          type="button"
          onClick={refreshMessages}
          disabled={loading}
        >
          <span aria-hidden="true">↻</span> {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="contact-message-stats">
        {[
          ["Total messages", counts.total, "✉️", "total"],
          ["New messages", counts.new, "●", "new"],
          ["Read messages", counts.read, "◉", "read"],
          ["Replied messages", counts.replied, "✓", "replied"]
        ].map(([label, value, icon, key]) => (
          <article className={`contact-message-stat contact-stat-${key}`} key={key}>
            <span className="contact-stat-icon" aria-hidden="true">{icon}</span>
            <div>
              <p>{label}</p>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </div>

      {error && <div className="contact-message-alert contact-alert-error" role="alert">{error}</div>}
      {notice && <div className="contact-message-alert contact-alert-success" role="status">{notice}</div>}

      <div className="contact-message-toolbar">
        <label className="contact-message-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={search}
            onChange={event => {
              setOffset(0)
              setSearch(event.target.value)
            }}
            placeholder="Search name, email, business or message"
            aria-label="Search contact messages"
          />
        </label>
        <label className="contact-status-filter">
          <span>Status</span>
          <select value={statusFilter} onChange={event => {
            setOffset(0)
            setStatusFilter(event.target.value)
          }}>
            <option value="">All statuses</option>
            {statuses.map(status => (
              <option value={status} key={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="contact-message-table-wrap">
        <table className="contact-message-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Business</th>
              <th>Message</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="contact-table-state" colSpan="6">Loading contact messages...</td></tr>
            ) : messages.length === 0 ? (
              <tr>
                <td className="contact-table-state" colSpan="6">
                  {error ? "Messages could not be loaded." : "No contact messages found."}
                </td>
              </tr>
            ) : messages.map(message => (
              <tr key={message.id}>
                <td>
                  <strong className="contact-sender-name">{message.name}</strong>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </td>
                <td>{message.business || <span className="contact-muted">—</span>}</td>
                <td className="contact-preview" title={message.message}>{message.message}</td>
                <td><span className={`contact-status-pill status-${message.status}`}>{message.status}</span></td>
                <td className="contact-date">{formatDate(message.created_at)}</td>
                <td>
                  <div className="contact-row-actions">
                    <button type="button" onClick={() => openMessage(message.id)}>View</button>
                    <select
                      aria-label={`Change status for ${message.name}`}
                      value={message.status}
                      disabled={updatingId === message.id}
                      onChange={event => updateStatus(message.id, event.target.value)}
                    >
                      {statuses.map(status => (
                        <option value={status} key={status}>{status}</option>
                      ))}
                    </select>
                    <button
                      className="contact-delete-button"
                      type="button"
                      disabled={deletingId === message.id}
                      onClick={() => deleteMessage(message)}
                    >
                      {deletingId === message.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && (
        <div className="contact-pagination">
          <span>
            {totalMatching === 0
              ? "No messages"
              : `Showing ${offset + 1}–${offset + messages.length} of ${totalMatching} matching messages`}
          </span>
          <div>
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(value => Math.max(0, value - pageSize))}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={offset + pageSize >= totalMatching}
              onClick={() => setOffset(value => value + pageSize)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedMessage && (
        <div className="contact-modal-backdrop" onMouseDown={event => {
          if (event.target === event.currentTarget) setSelectedMessage(null)
        }}>
          <section
            className="contact-message-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-message-title"
          >
            <div className="contact-modal-heading">
              <div>
                <p className="eyebrow">WEBSITE ENQUIRY</p>
                <h2 id="contact-message-title">{selectedMessage.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedMessage(null)} aria-label="Close message">×</button>
            </div>
            <div className="contact-detail-meta">
              <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
              <span>{selectedMessage.business || "Business not provided"}</span>
              <time dateTime={selectedMessage.created_at}>{formatDate(selectedMessage.created_at)}</time>
            </div>
            <div className="contact-detail-message">{selectedMessage.message}</div>
            <div className="contact-modal-actions">
              <label>
                Status
                <select
                  value={selectedMessage.status}
                  disabled={updatingId === selectedMessage.id}
                  onChange={event => updateStatus(selectedMessage.id, event.target.value)}
                >
                  {statuses.map(status => (
                    <option value={status} key={status}>{status}</option>
                  ))}
                </select>
              </label>
              <button
                className="contact-delete-button"
                type="button"
                disabled={deletingId === selectedMessage.id}
                onClick={() => deleteMessage(selectedMessage)}
              >
                Delete message
              </button>
            </div>
          </section>
        </div>
      )}

      {detailLoading && (
        <div className="contact-modal-backdrop">
          <div className="contact-message-modal contact-detail-loading" role="status">
            Loading message...
          </div>
        </div>
      )}
    </section>
  )
}

export default ContactMessages
