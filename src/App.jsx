import { useEffect, useState } from "react"
import "./App.css"

const API_BASE = "https://ai-business-manager-2.onrender.com"

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("token")
  const {
    skipAuth = false,
    headers: customHeaders = {},
    ...requestOptions
  } = options

  const headers = {
    "Content-Type": "application/json",
    ...customHeaders
  }

  if (token && !skipAuth) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...requestOptions,
    headers
  })

  const data = await response.json().catch(() => ({}))

  if (response.status === 401 && !skipAuth) {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.dispatchEvent(new Event("auth-expired"))
  }

  if (!response.ok) {
    const error = new Error(
      data.detail ||
      data.message ||
      `Request failed with status ${response.status}`
    )
    error.status = response.status
    throw error
  }

  return data
}

function ErrorMessage({ error }) {
  if (!error) return null

  return (
    <div className="error-box">
      {error}
    </div>
  )
}

// =============================
// DASHBOARD
// =============================

function Dashboard({ setPage }) {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setError("")
      const data = await apiRequest("/api/dashboard")
      setDashboard(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const summary = dashboard?.summary || {}
  const appointments = dashboard?.recent_appointments || []
  const orders = dashboard?.recent_orders || []

  return (
    <div className="page">

      <div className="welcome">
        <div>
          <p className="eyebrow">BUSINESS OVERVIEW</p>
          <h1>Good Morning, Aanchal! 👋</h1>
          <p>Here's what's happening with your business today.</p>
        </div>

        <div className="today-badge">
          <span>●</span> Live Data
        </div>
      </div>

      <ErrorMessage error={error} />

      <div className="cards">

        <div className="card">
          <div className="card-icon purple">👥</div>
          <p>Total Customers</p>
          <h2>{summary.total_customers ?? 0}</h2>
          <small>From PostgreSQL</small>
        </div>

        <div className="card">
          <div className="card-icon blue">📅</div>
          <p>Total Appointments</p>
          <h2>{summary.total_appointments ?? 0}</h2>
          <small>{summary.pending_appointments ?? 0} pending</small>
        </div>

        <div className="card">
          <div className="card-icon orange">💰</div>
          <p>Paid Revenue</p>
          <h2>₹{Number(summary.total_revenue || 0).toLocaleString()}</h2>
          <small>Paid invoices</small>
        </div>

        <div className="card">
          <div className="card-icon red">⏳</div>
          <p>Pending Orders</p>
          <h2>{summary.pending_orders ?? 0}</h2>
          <small>{summary.total_orders ?? 0} total orders</small>
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="section-box">
          <div className="section-header">
            <div>
              <h2>Recent Appointments</h2>
              <p>Latest appointments from your database</p>
            </div>

            <button
              className="text-button"
              onClick={() => setPage("appointments")}
            >
              View All →
            </button>
          </div>

          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            appointments.map(item => (
              <div className="appointment-mini" key={item.id}>
                <div>
                  <strong>{item.customer_name}</strong>
                  <span>{item.service}</span>
                </div>

                <b>
                  {item.appointment_date} {String(item.appointment_time).slice(0, 5)}
                </b>

                <span className={`status ${item.status}`}>
                  {item.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="section-box">

          <div className="section-header">
            <div>
              <h2>Recent Orders</h2>
              <p>Latest orders from your database</p>
            </div>

            <button
              className="text-button"
              onClick={() => setPage("orders")}
            >
              View All →
            </button>
          </div>

          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map(item => (
              <div className="service-row" key={item.id}>
                <div>
                  <strong>{item.customer_name}</strong>
                  <span>{item.service_name}</span>
                </div>

                <div className="service-bar">
                  <div
                    className="service-fill"
                    style={{ width: "70%" }}
                  />
                </div>

                <strong>
                  ₹{Number(item.total_amount || 0).toLocaleString()}
                </strong>
              </div>
            ))
          )}
        </div>

      </div>

      <div className="ai-dashboard-insight">
        <div className="ai-dashboard-icon">🤖</div>

        <div>
          <span>AI BUSINESS ASSISTANT</span>
          <h3>Your dashboard is now connected to FastAPI</h3>
          <p>
            Ask the AI Assistant questions and it will read your
            current business data from PostgreSQL.
          </p>
        </div>

        <button onClick={() => setPage("ai")}>
          Ask AI →
        </button>
      </div>

    </div>
  )
}

// =============================
// CUSTOMERS
// =============================

function Customers() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setError("")
      const data = await apiRequest("/api/customers")
      setCustomers(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setName("")
    setPhone("")
    setEmail("")
    setAddress("")
    setShowForm(true)
  }

  const openEdit = customer => {
    setEditing(customer)
    setName(customer.name)
    setPhone(customer.phone)
    setEmail(customer.email || "")
    setAddress(customer.address || "")
    setShowForm(true)
  }

  const save = async () => {
    if (!name || !phone) {
      alert("Please fill name and phone.")
      return
    }

    try {
      setError("")

      const body = {
        name,
        phone,
        email,
        address
      }

      if (editing) {
        await apiRequest(`/api/customers/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        })
      } else {
        await apiRequest("/api/customers", {
          method: "POST",
          body: JSON.stringify(body)
        })
      }

      setShowForm(false)
      await loadCustomers()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async id => {
    if (!window.confirm("Delete this customer?")) return

    try {
      setError("")

      await apiRequest(`/api/customers/${id}`, {
        method: "DELETE"
      })

      await loadCustomers()
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = customers.filter(customer =>
    `${customer.name} ${customer.phone} ${customer.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="page">

      <div className="page-title">
        <div>
          <p className="eyebrow">CUSTOMER MANAGEMENT</p>
          <h1>Customers</h1>
          <p>Manage customers directly from PostgreSQL.</p>
        </div>

        <button className="primary-button" onClick={openAdd}>
          + Add Customer
        </button>
      </div>

      <ErrorMessage error={error} />

      <div className="toolbar">
        <input
          placeholder="Search customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <span>{filtered.length} Customers</span>
      </div>

      <div className="data-table">

        <div className="customer-header">
          <span>Name</span>
          <span>Phone</span>
          <span>Email</span>
          <span>Address</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="customer-row">
            <span>No customers found.</span>
          </div>
        ) : (
          filtered.map(customer => (
            <div className="customer-row" key={customer.id}>
              <strong>{customer.name}</strong>
              <span>{customer.phone}</span>
              <span>{customer.email || "-"}</span>
              <span>{customer.address || "-"}</span>

              <div className="actions">
                <button
                  className="edit-button"
                  onClick={() => openEdit(customer)}
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => remove(customer.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-box">

            <div className="form-header">
              <div>
                <p className="eyebrow">CUSTOMER</p>
                <h2>{editing ? "Edit Customer" : "Add Customer"}</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label>Name</label>
            <input
              value={name}
              placeholder="Customer name"
              onChange={e => setName(e.target.value)}
            />

            <label>Phone</label>
            <input
              value={phone}
              placeholder="Phone number"
              onChange={e => setPhone(e.target.value)}
            />

            <label>Email</label>
            <input
              value={email}
              placeholder="Email address"
              onChange={e => setEmail(e.target.value)}
            />

            <label>Address</label>
            <textarea
              value={address}
              placeholder="Customer address"
              onChange={e => setAddress(e.target.value)}
              rows="3"
            />

            <div className="form-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button className="primary-button" onClick={save}>
                {editing ? "Update Customer" : "Save Customer"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

// =============================
// APPOINTMENTS
// =============================

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  const [customerId, setCustomerId] = useState("")
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [status, setStatus] = useState("pending")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError("")

      const [appointmentData, customerData] = await Promise.all([
        apiRequest("/api/appointments"),
        apiRequest("/api/customers")
      ])

      setAppointments(appointmentData)
      setCustomers(customerData)
    } catch (err) {
      setError(err.message)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setCustomerId("")
    setService("")
    setDate("")
    setTime("")
    setStatus("pending")
    setShowForm(true)
  }

  const openEdit = item => {
    setEditing(item)
    setCustomerId(String(item.customer_id))
    setService(item.service)
    setDate(String(item.appointment_date))
    setTime(String(item.appointment_time).slice(0, 5))
    setStatus(item.status)
    setShowForm(true)
  }

  const save = async () => {
    if (!customerId || !service || !date || !time) {
      alert("Please fill all fields.")
      return
    }

    try {
      setError("")

      const body = {
        customer_id: Number(customerId),
        appointment_date: date,
        appointment_time: time,
        service,
        status
      }

      if (editing) {
        await apiRequest(`/api/appointments/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        })
      } else {
        await apiRequest("/api/appointments", {
          method: "POST",
          body: JSON.stringify(body)
        })
      }

      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async id => {
    if (!window.confirm("Delete this appointment?")) return

    try {
      setError("")

      await apiRequest(`/api/appointments/${id}`, {
        method: "DELETE"
      })

      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = appointments.filter(item =>
    `${item.customer_name} ${item.service}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="page">

      <div className="page-title">
        <div>
          <p className="eyebrow">SCHEDULE MANAGEMENT</p>
          <h1>Appointments</h1>
          <p>Manage appointments using the real backend.</p>
        </div>

        <button className="primary-button" onClick={openAdd}>
          + Add Appointment
        </button>
      </div>

      <ErrorMessage error={error} />

      <div className="toolbar">
        <input
          placeholder="Search customer or service..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <span>{filtered.length} Appointments</span>
      </div>

      <div className="data-table">

        <div className="appointment-header">
          <span>Customer</span>
          <span>Service</span>
          <span>Date</span>
          <span>Time</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filtered.map(item => (
          <div className="appointment-row" key={item.id}>
            <strong>{item.customer_name}</strong>
            <span>{item.service}</span>
            <span>{item.appointment_date}</span>
            <span>{String(item.appointment_time).slice(0, 5)}</span>

            <span>
              <b className={`status ${item.status}`}>
                {item.status}
              </b>
            </span>

            <div className="actions">
              <button
                className="edit-button"
                onClick={() => openEdit(item)}
              >
                Edit
              </button>

              <button
                className="delete-button"
                onClick={() => remove(item.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-box">

            <div className="form-header">
              <div>
                <p className="eyebrow">APPOINTMENT</p>
                <h2>{editing ? "Edit Appointment" : "Add Appointment"}</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label>Customer</label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <label>Service</label>
            <input
              value={service}
              placeholder="e.g. Website Development"
              onChange={e => setService(e.target.value)}
            />

            <div className="form-row">
              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div>
                <label>Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </div>
            </div>

            <label>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="form-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button className="primary-button" onClick={save}>
                {editing ? "Update Appointment" : "Save Appointment"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

// =============================
// ORDERS / SERVICES
// =============================

function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  const [customerId, setCustomerId] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState("pending")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError("")

      const [orderData, customerData, serviceData] = await Promise.all([
        apiRequest("/api/orders"),
        apiRequest("/api/customers"),
        apiRequest("/api/services")
      ])

      setOrders(orderData)
      setCustomers(customerData)
      setServices(serviceData)
    } catch (err) {
      setError(err.message)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setCustomerId("")
    setServiceId("")
    setQuantity(1)
    setStatus("pending")
    setShowForm(true)
  }

  const openEdit = order => {
    setEditing(order)
    setCustomerId(String(order.customer_id))
    setServiceId(String(order.service_id))
    setQuantity(order.quantity)
    setStatus(order.status)
    setShowForm(true)
  }

  const save = async () => {
    if (!customerId || !serviceId || Number(quantity) < 1) {
      alert("Please select customer, service and quantity.")
      return
    }

    try {
      setError("")

      const body = {
        customer_id: Number(customerId),
        service_id: Number(serviceId),
        quantity: Number(quantity),
        status
      }

      if (editing) {
        await apiRequest(`/api/orders/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        })
      } else {
        await apiRequest("/api/orders", {
          method: "POST",
          body: JSON.stringify(body)
        })
      }

      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async id => {
    if (!window.confirm("Delete this order?")) return

    try {
      setError("")

      await apiRequest(`/api/orders/${id}`, {
        method: "DELETE"
      })

      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = orders.filter(order =>
    `${order.customer_name} ${order.service_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const revenue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  )

  return (
    <div className="page">

      <div className="page-title">
        <div>
          <p className="eyebrow">SALES MANAGEMENT</p>
          <h1>Orders / Services</h1>
          <p>Orders and services are now connected to PostgreSQL.</p>
        </div>

        <button className="primary-button" onClick={openAdd}>
          + Add Order
        </button>
      </div>

      <ErrorMessage error={error} />

      <div className="summary-grid">

        <div className="summary-card">
          <span>🛍️</span>
          <div>
            <p>Total Orders</p>
            <h2>{orders.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span>💰</span>
          <div>
            <p>Order Value</p>
            <h2>₹{revenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span>✅</span>
          <div>
            <p>Completed</p>
            <h2>
              {orders.filter(o => o.status === "completed").length}
            </h2>
          </div>
        </div>

        <div className="summary-card">
          <span>⏳</span>
          <div>
            <p>Pending</p>
            <h2>
              {orders.filter(o => o.status === "pending").length}
            </h2>
          </div>
        </div>

      </div>

      <div className="toolbar">
        <input
          placeholder="Search customer or service..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <span>{filtered.length} Orders</span>
      </div>

      <div className="data-table">

        <div className="order-header">
          <span>Customer</span>
          <span>Service</span>
          <span>Quantity</span>
          <span>Total</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filtered.map(order => (
          <div className="order-row-page" key={order.id}>
            <strong>{order.customer_name}</strong>
            <span>{order.service_name}</span>
            <span>{order.quantity}</span>
            <strong>
              ₹{Number(order.total_amount || 0).toLocaleString()}
            </strong>

            <span>
              <b className={`status ${order.status}`}>
                {order.status}
              </b>
            </span>

            <div className="actions">
              <button
                className="edit-button"
                onClick={() => openEdit(order)}
              >
                Edit
              </button>

              <button
                className="delete-button"
                onClick={() => remove(order.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-box">

            <div className="form-header">
              <div>
                <p className="eyebrow">ORDER</p>
                <h2>{editing ? "Edit Order" : "Add Order"}</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label>Customer</label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <label>Service</label>
            <select
              value={serviceId}
              onChange={e => setServiceId(e.target.value)}
            >
              <option value="">Select Service</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.name} — ₹{Number(service.price).toLocaleString()}
                </option>
              ))}
            </select>

            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />

            <label>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="form-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button className="primary-button" onClick={save}>
                {editing ? "Update Order" : "Save Order"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

// =============================
// BILLING
// =============================

function Billing() {
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState("")
  const [error, setError] = useState("")

  const [customerId, setCustomerId] = useState("")
  const [orderId, setOrderId] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("unpaid")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError("")

      const [invoiceData, customerData, orderData] = await Promise.all([
        apiRequest("/api/invoices"),
        apiRequest("/api/customers"),
        apiRequest("/api/orders")
      ])

      setInvoices(invoiceData)
      setCustomers(customerData)
      setOrders(orderData)
    } catch (err) {
      setError(err.message)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setCustomerId("")
    setOrderId("")
    setInvoiceNumber(`INV-${Date.now()}`)
    setAmount("")
    setPaymentStatus("unpaid")
    setShowForm(true)
  }

  const openEdit = invoice => {
    setEditing(invoice)
    setCustomerId(String(invoice.customer_id))
    setOrderId(invoice.order_id ? String(invoice.order_id) : "")
    setInvoiceNumber(invoice.invoice_number)
    setAmount(invoice.amount)
    setPaymentStatus(invoice.payment_status)
    setShowForm(true)
  }

  const save = async () => {
    if (!customerId || !invoiceNumber || !amount) {
      alert("Please fill customer, invoice number and amount.")
      return
    }

    try {
      setError("")

      const body = {
        customer_id: Number(customerId),
        order_id: orderId ? Number(orderId) : null,
        invoice_number: invoiceNumber,
        amount: Number(amount),
        payment_status: paymentStatus
      }

      if (editing) {
        await apiRequest(`/api/invoices/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(body)
        })
      } else {
        await apiRequest("/api/invoices", {
          method: "POST",
          body: JSON.stringify(body)
        })
      }

      setShowForm(false)
      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async id => {
    if (!window.confirm("Delete this invoice?")) return

    try {
      setError("")

      await apiRequest(`/api/invoices/${id}`, {
        method: "DELETE"
      })

      await loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = invoices.filter(invoice =>
    `${invoice.invoice_number} ${invoice.customer_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const paidAmount = invoices
    .filter(invoice => invoice.payment_status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)

  const unpaidAmount = invoices
    .filter(invoice => invoice.payment_status === "unpaid")
    .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0)

  return (
    <div className="page">

      <div className="page-title">
        <div>
          <p className="eyebrow">FINANCE MANAGEMENT</p>
          <h1>Billing & Invoices</h1>
          <p>Invoices are now stored in PostgreSQL.</p>
        </div>

        <button className="primary-button" onClick={openAdd}>
          + Create Invoice
        </button>
      </div>

      <ErrorMessage error={error} />

      <div className="summary-grid">

        <div className="summary-card">
          <span>🧾</span>
          <div>
            <p>Total Invoices</p>
            <h2>{invoices.length}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span>✅</span>
          <div>
            <p>Paid</p>
            <h2>₹{paidAmount.toLocaleString()}</h2>
          </div>
        </div>

        <div className="summary-card">
          <span>⏳</span>
          <div>
            <p>Unpaid</p>
            <h2>₹{unpaidAmount.toLocaleString()}</h2>
          </div>
        </div>

      </div>

      <div className="toolbar">
        <input
          placeholder="Search invoice or customer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <span>{filtered.length} Invoices</span>
      </div>

      <div className="data-table">

        <div className="billing-header">
          <span>Invoice</span>
          <span>Customer</span>
          <span>Order</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filtered.map(invoice => (
          <div className="billing-row" key={invoice.id}>
            <strong>{invoice.invoice_number}</strong>
            <span>{invoice.customer_name}</span>
            <span>{invoice.order_id || "-"}</span>
            <strong>₹{Number(invoice.amount || 0).toLocaleString()}</strong>

            <span>
              <b className={`status ${invoice.payment_status}`}>
                {invoice.payment_status}
              </b>
            </span>

            <div className="actions">
              <button
                className="edit-button"
                onClick={() => openEdit(invoice)}
              >
                Edit
              </button>

              <button
                className="delete-button"
                onClick={() => remove(invoice.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-box">

            <div className="form-header">
              <div>
                <p className="eyebrow">INVOICE</p>
                <h2>{editing ? "Edit Invoice" : "Create Invoice"}</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <label>Customer</label>
            <select
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <label>Order (optional)</label>
            <select
              value={orderId}
              onChange={e => {
                const value = e.target.value
                setOrderId(value)

                const selectedOrder = orders.find(
                  order => String(order.id) === value
                )

                if (selectedOrder) {
                  setAmount(selectedOrder.total_amount)
                }
              }}
            >
              <option value="">No Order</option>
              {orders
                .filter(order =>
                  !customerId ||
                  String(order.customer_id) === String(customerId)
                )
                .map(order => (
                  <option key={order.id} value={order.id}>
                    #{order.id} — ₹{Number(order.total_amount).toLocaleString()}
                  </option>
                ))}
            </select>

            <label>Invoice Number</label>
            <input
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
            />

            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />

            <label>Payment Status</label>
            <select
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value)}
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
            </select>

            <div className="form-buttons">
              <button
                className="cancel-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button className="primary-button" onClick={save}>
                {editing ? "Update Invoice" : "Save Invoice"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

// =============================
// REPORTS
// =============================

function Reports() {
  const [reports, setReports] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setError("")
      setLoading(true)

      const data = await apiRequest("/api/reports")

      setReports(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const summary = reports?.summary || {}

  const monthlyRevenue = reports?.monthly_revenue || []
  const ordersByStatus = reports?.orders_by_status || []
  const appointmentsByStatus = reports?.appointments_by_status || []

  const maxRevenue = Math.max(
    ...monthlyRevenue.map(item => Number(item.revenue) || 0),
    1
  )

  const totalOrdersStatus = ordersByStatus.reduce(
    (total, item) => total + Number(item.count || 0),
    0
  )

  const totalAppointmentsStatus = appointmentsByStatus.reduce(
    (total, item) => total + Number(item.count || 0),
    0
  )

  const formatMonth = month => {
    if (!month) return "-"

    const [year, monthNumber] = month.split("-")

    const date = new Date(
      Number(year),
      Number(monthNumber) - 1,
      1
    )

    return date.toLocaleString("en-IN", {
      month: "short",
      year: "numeric"
    })
  }

  const formatCurrency = value => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`
  }

  const formatStatus = status => {
    if (!status) return "Unknown"

    return (
      String(status).charAt(0).toUpperCase() +
      String(status).slice(1)
    )
  }

  const getStatusClass = status => {
    const value = String(status || "").toLowerCase()

    if (value === "completed") return "status-completed"
    if (value === "pending") return "status-pending"
    if (value === "confirmed") return "status-confirmed"
    if (value === "cancelled") return "status-cancelled"

    return "status-default"
  }

  const getStatusColor = status => {
    const value = String(status || "").toLowerCase()

    if (value === "completed") return "#16a34a"
    if (value === "pending") return "#f59e0b"
    if (value === "confirmed") return "#2563eb"
    if (value === "cancelled") return "#dc2626"

    return "#64748b"
  }

  return (
    <div className="page">

      {/* =============================
          PAGE HEADER
      ============================= */}

      <div className="page-title">

        <div>
          <p className="eyebrow">
            BUSINESS ANALYTICS
          </p>

          <h1>
            Reports & Analytics
          </h1>

          <p>
            Live business analytics generated from your PostgreSQL database.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={loadReports}
          disabled={loading}
        >
          {loading
            ? "Refreshing..."
            : "↻ Refresh Reports"}
        </button>

      </div>


      <ErrorMessage error={error} />


      {/* =============================
          LOADING
      ============================= */}

      {loading && !reports && (
        <div className="section-box">
          <p>Loading reports...</p>
        </div>
      )}


      {reports && (
        <>

          {/* =============================
              SUMMARY CARDS
          ============================= */}

          <div className="report-summary">

            <div className="report-card">
              <span>💰</span>

              <div>
                <p>Paid Revenue</p>

                <h2>
                  {formatCurrency(
                    summary.paid_revenue
                  )}
                </h2>
              </div>
            </div>


            <div className="report-card">
              <span>🛍️</span>

              <div>
                <p>Total Orders</p>

                <h2>
                  {summary.total_orders ?? 0}
                </h2>
              </div>
            </div>


            <div className="report-card">
              <span>📅</span>

              <div>
                <p>Total Appointments</p>

                <h2>
                  {summary.total_appointments ?? 0}
                </h2>
              </div>
            </div>


            <div className="report-card">
              <span>👥</span>

              <div>
                <p>Total Customers</p>

                <h2>
                  {summary.total_customers ?? 0}
                </h2>
              </div>
            </div>

          </div>


          <div className="report-summary">

            <div className="report-card">
              <span>✅</span>

              <div>
                <p>Completed Orders</p>

                <h2>
                  {summary.completed_orders ?? 0}
                </h2>
              </div>
            </div>


            <div className="report-card">
              <span>🎯</span>

              <div>
                <p>Completed Appointments</p>

                <h2>
                  {summary.completed_appointments ?? 0}
                </h2>
              </div>
            </div>


            <div className="report-card">
              <span>💳</span>

              <div>
                <p>Unpaid Amount</p>

                <h2>
                  {formatCurrency(
                    summary.unpaid_amount
                  )}
                </h2>
              </div>
            </div>


            <div className="report-card">
              <span>📦</span>

              <div>
                <p>Total Order Value</p>

                <h2>
                  {formatCurrency(
                    summary.total_order_value
                  )}
                </h2>
              </div>
            </div>

          </div>


          {/* =============================
              MONTHLY REVENUE CHART
          ============================= */}

          <div className="report-section">

            <div className="report-section-header">

              <div>
                <h2>
                  Monthly Revenue
                </h2>

                <p>
                  Paid invoice revenue for the current year
                </p>
              </div>

              <div className="today-badge">
                <span>●</span>
                Live Data
              </div>

            </div>


            {monthlyRevenue.length === 0 ? (

              <div className="empty-state">

                <div>📊</div>

                <p>
                  No monthly revenue data available yet.
                </p>

              </div>

            ) : (

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "18px",
                  height: "320px",
                  padding: "30px 20px 10px",
                  overflowX: "auto",
                  borderTop: "1px solid #eee"
                }}
              >

                {monthlyRevenue.map(item => {

                  const revenue =
                    Number(item.revenue) || 0

                  const height =
                    revenue > 0
                      ? Math.max(
                          (revenue / maxRevenue) * 230,
                          12
                        )
                      : 0

                  return (

                    <div
                      key={item.month}
                      style={{
                        minWidth: "80px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >

                      <strong
                        style={{
                          fontSize: "13px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {formatCurrency(revenue)}
                      </strong>


                      <div
                        style={{
                          width: "48px",
                          height: `${height}px`,
                          background:
                            "linear-gradient(180deg, #ff7900, #ff9d45)",
                          borderRadius:
                            "8px 8px 2px 2px",
                          transition:
                            "height 0.5s ease",
                          boxShadow:
                            "0 5px 15px rgba(255,121,0,0.18)"
                        }}
                      />


                      <span
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: 600,
                          whiteSpace: "nowrap"
                        }}
                      >
                        {formatMonth(item.month)}
                      </span>

                    </div>

                  )

                })}

              </div>

            )}

          </div>


          {/* =============================
              STATUS CHARTS
          ============================= */}

          <div className="reports-two-column">


            {/* ORDERS */}

            <div className="report-section">

              <div className="report-section-header">

                <div>
                  <h2>
                    Orders by Status
                  </h2>

                  <p>
                    Current order distribution
                  </p>
                </div>

              </div>


              {ordersByStatus.length === 0 ? (

                <div className="empty-state">

                  <div>🛍️</div>

                  <p>
                    No order data available yet.
                  </p>

                </div>

              ) : (

                <div>

                  {/* Visual bar */}

                  <div
                    style={{
                      height: "18px",
                      display: "flex",
                      overflow: "hidden",
                      borderRadius: "999px",
                      background: "#e5e7eb",
                      marginBottom: "25px"
                    }}
                  >

                    {ordersByStatus.map(item => {

                      const count =
                        Number(item.count) || 0

                      const percentage =
                        totalOrdersStatus > 0
                          ? (count /
                              totalOrdersStatus) *
                            100
                          : 0

                      return (

                        <div
                          key={item.status}
                          title={`${formatStatus(
                            item.status
                          )}: ${count}`}
                          style={{
                            width: `${percentage}%`,
                            background:
                              getStatusColor(
                                item.status
                              ),
                            transition:
                              "width 0.5s ease"
                          }}
                        />

                      )

                    })}

                  </div>


                  {/* Status rows */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px"
                    }}
                  >

                    {ordersByStatus.map(item => {

                      const count =
                        Number(item.count) || 0

                      const percentage =
                        totalOrdersStatus > 0
                          ? (
                              (count /
                                totalOrdersStatus) *
                              100
                            ).toFixed(1)
                          : 0

                      return (

                        <div
                          key={item.status}
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "center"
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px"
                            }}
                          >

                            <span
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background:
                                  getStatusColor(
                                    item.status
                                  )
                              }}
                            />

                            <strong>
                              {formatStatus(
                                item.status
                              )}
                            </strong>

                          </div>


                          <div
                            style={{
                              display: "flex",
                              gap: "12px",
                              alignItems: "center"
                            }}
                          >

                            <span
                              style={{
                                color: "#64748b"
                              }}
                            >
                              {percentage}%
                            </span>

                            <strong>
                              {count}
                            </strong>

                          </div>

                        </div>

                      )

                    })}

                  </div>

                </div>

              )}

            </div>


            {/* APPOINTMENTS */}

            <div className="report-section">

              <div className="report-section-header">

                <div>
                  <h2>
                    Appointments by Status
                  </h2>

                  <p>
                    Current appointment distribution
                  </p>
                </div>

              </div>


              {appointmentsByStatus.length === 0 ? (

                <div className="empty-state">

                  <div>📅</div>

                  <p>
                    No appointment data available yet.
                  </p>

                </div>

              ) : (

                <div>

                  {/* Visual bar */}

                  <div
                    style={{
                      height: "18px",
                      display: "flex",
                      overflow: "hidden",
                      borderRadius: "999px",
                      background: "#e5e7eb",
                      marginBottom: "25px"
                    }}
                  >

                    {appointmentsByStatus.map(item => {

                      const count =
                        Number(item.count) || 0

                      const percentage =
                        totalAppointmentsStatus > 0
                          ? (count /
                              totalAppointmentsStatus) *
                            100
                          : 0

                      return (

                        <div
                          key={item.status}
                          title={`${formatStatus(
                            item.status
                          )}: ${count}`}
                          style={{
                            width: `${percentage}%`,
                            background:
                              getStatusColor(
                                item.status
                              ),
                            transition:
                              "width 0.5s ease"
                          }}
                        />

                      )

                    })}

                  </div>


                  {/* Status rows */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px"
                    }}
                  >

                    {appointmentsByStatus.map(item => {

                      const count =
                        Number(item.count) || 0

                      const percentage =
                        totalAppointmentsStatus > 0
                          ? (
                              (count /
                                totalAppointmentsStatus) *
                              100
                            ).toFixed(1)
                          : 0

                      return (

                        <div
                          key={item.status}
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            alignItems: "center"
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px"
                            }}
                          >

                            <span
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background:
                                  getStatusColor(
                                    item.status
                                  )
                              }}
                            />

                            <strong>
                              {formatStatus(
                                item.status
                              )}
                            </strong>

                          </div>


                          <div
                            style={{
                              display: "flex",
                              gap: "12px",
                              alignItems: "center"
                            }}
                          >

                            <span
                              style={{
                                color: "#64748b"
                              }}
                            >
                              {percentage}%
                            </span>

                            <strong>
                              {count}
                            </strong>

                          </div>

                        </div>

                      )

                    })}

                  </div>

                </div>

              )}

            </div>

          </div>


          {/* =============================
              BUSINESS STATUS
          ============================= */}

          <div className="report-section">

            <div className="report-section-header">

              <div>
                <h2>
                  Business Status
                </h2>

                <p>
                  Current overall business performance
                </p>
              </div>

            </div>


            <div className="report-summary">

              <div className="report-card">
                <span>✅</span>

                <div>
                  <p>Completed Orders</p>

                  <h2>
                    {summary.completed_orders ?? 0}
                  </h2>
                </div>
              </div>


              <div className="report-card">
                <span>🎯</span>

                <div>
                  <p>Completed Appointments</p>

                  <h2>
                    {summary.completed_appointments ?? 0}
                  </h2>
                </div>
              </div>


              <div className="report-card">
                <span>💳</span>

                <div>
                  <p>Unpaid Amount</p>

                  <h2>
                    {formatCurrency(
                      summary.unpaid_amount
                    )}
                  </h2>
                </div>
              </div>


              <div className="report-card">
                <span>📦</span>

                <div>
                  <p>Total Order Value</p>

                  <h2>
                    {formatCurrency(
                      summary.total_order_value
                    )}
                  </h2>
                </div>
              </div>

            </div>

          </div>


          {/* =============================
              REPORT FOOTER
          ============================= */}

          <div className="section-box">

            <div className="section-header">

              <div>

                <h2>
                  Report Data
                </h2>

                <p>
                  All figures shown above are calculated from
                  your live PostgreSQL business data through
                  the FastAPI backend.
                </p>

              </div>

              <div className="today-badge">

                <span>●</span>

                Live Data

              </div>

            </div>

          </div>

        </>
      )}

    </div>
  )
}

// =============================
// AI ASSISTANT
// =============================

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      type: "ai",
      text:
        "Hello Aanchal! 👋 Ask me about your customers, orders, appointments, services or revenue."
    }
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const quickQuestions = [
    "How many customers do I have?",
    "How many orders do I have?",
    "How many appointments do I have?",
    "What is my revenue?",
    "Give me a business summary"
  ]

  const sendMessage = async text => {
    const question = text.trim()

    if (!question || loading) return

    setMessages(prev => [
      ...prev,
      {
        type: "user",
        text: question
      }
    ])

    setInput("")
    setLoading(true)
    setError("")

    try {
      const data = await apiRequest("/api/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          question
        })
      })

      setMessages(prev => [
        ...prev,
        {
          type: "ai",
          text: data.answer
        }
      ])
    } catch (err) {
      setError(err.message)

      setMessages(prev => [
        ...prev,
        {
          type: "ai",
          text: "I could not reach the backend right now."
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="page ai-page">

      <div className="page-title">
        <div>
          <p className="eyebrow">AI POWERED</p>
          <h1>AI Business Assistant 🤖</h1>
          <p>Ask questions about your real business database.</p>
        </div>
      </div>

      <ErrorMessage error={error} />

      <div className="ai-layout">

        <div className="ai-chat-card">

          <div className="ai-chat-header">
            <div className="ai-avatar">🤖</div>

            <div>
              <h2>Business AI</h2>
              <span>● Connected to FastAPI</span>
            </div>
          </div>

          <div className="chat-messages">

            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.type === "user"
                    ? "message user-message"
                    : "message ai-message"
                }
              >

                {message.type === "ai" && (
                  <div className="message-avatar">🤖</div>
                )}

                <div className="message-content">
                  {message.text}
                </div>

              </div>
            ))}

            {loading && (
              <div className="message ai-message">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  Thinking...
                </div>
              </div>
            )}

          </div>

          <div className="quick-questions">
            <p>Quick questions</p>

            <div>
              {quickQuestions.map(question => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <form
            className="ai-input-area"
            onSubmit={handleSubmit}
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask something about your business..."
            />

            <button type="submit">
              ➤
            </button>
          </form>

        </div>

        <div className="ai-side-panel">

          <div className="ai-info-card">
            <div className="ai-info-icon">📊</div>

            <h3>Live Business Data</h3>

            <p>
              Your questions are now sent to the Python backend,
              which reads the PostgreSQL database.
            </p>
          </div>

          <div className="ai-coming-card">
            <div>🚀</div>
            <h3>Next AI Upgrade</h3>
            <p>
              Later we can connect a real AI model so the assistant
              can understand more natural business questions.
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

// =============================
// SETTINGS
// =============================

function Settings() {
  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setError("")

      const data = await apiRequest("/api/settings")

      setBusinessName(data.business_name || "")
      setEmail(data.email || "")
      setPhone(data.phone || "")
      setAddress(data.address || "")
    } catch (err) {
      setError(err.message)
    }
  }

  const saveSettings = async () => {
    try {
      setError("")
      setMessage("")

      await apiRequest("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          business_name: businessName,
          email,
          phone,
          address
        })
      })

      setMessage("Settings saved successfully.")
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">

      <div className="page-title">
        <div>
          <p className="eyebrow">APPLICATION SETTINGS</p>
          <h1>Settings</h1>
          <p>Manage your business information stored in PostgreSQL.</p>
        </div>
      </div>

      <ErrorMessage error={error} />

      {message && (
        <div className="success-box">
          {message}
        </div>
      )}

      <div className="settings-grid">

        <div className="settings-main">

          <div className="settings-card">

            <div className="settings-card-header">
              <div className="settings-icon">🏢</div>

              <div>
                <h2>Business Profile</h2>
                <p>Basic information about your business.</p>
              </div>
            </div>

            <div className="settings-form-grid">

              <div>
                <label>Business Name</label>
                <input
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label>Email Address</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label>Phone Number</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div className="full">
                <label>Business Address</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows="3"
                />
              </div>

            </div>

          </div>

          <div className="settings-actions">
            <button
              className="primary-button"
              onClick={saveSettings}
            >
              Save Changes
            </button>
          </div>

        </div>

        <div className="settings-side">

          <div className="profile-preview">

            <div className="business-avatar">
              IS
            </div>

            <h2>{businessName || "ITSoft"}</h2>

            <p>AI Business Manager</p>

            <div className="profile-line" />

            <div className="profile-detail">
              <span>📧</span>
              <strong>{email || "-"}</strong>
            </div>

            <div className="profile-detail">
              <span>📞</span>
              <strong>{phone || "-"}</strong>
            </div>

            <div className="profile-detail">
              <span>📍</span>
              <strong>{address || "-"}</strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

// =============================
// AUTH SCREEN
// =============================

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async e => {
    e.preventDefault()
    setError("")

    if (!email || !password || (mode === "signup" && !name)) {
      setError("Please fill all required fields.")
      return
    }

    try {
      setLoading(true)

      if (mode === "signup") {
        await apiRequest("/api/auth/signup", {
          method: "POST",
          skipAuth: true,
          body: JSON.stringify({ name, email, password })
        })
      }

      const data = await apiRequest("/api/auth/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email, password })
      })

      localStorage.setItem("token", data.access_token)
      localStorage.setItem("user", JSON.stringify(data.user || {}))
      onLogin(data.user || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f4f5f7",
      padding: "24px",
      fontFamily: "Inter, Arial, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "430px",
        background: "#fff",
        borderRadius: "22px",
        padding: "40px",
        boxShadow: "0 20px 60px rgba(0,0,0,.10)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "62px",
            height: "62px",
            borderRadius: "18px",
            background: "#ff7a00",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: "24px",
            fontWeight: 800
          }}>
            IS
          </div>
          <h1 style={{ margin: 0, fontSize: "30px" }}>ITSoft</h1>
          <p style={{ color: "#777", marginTop: "8px" }}>AI Business Manager</p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button
            type="button"
            onClick={() => { setMode("login"); setError("") }}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              background: mode === "login" ? "#ff7a00" : "#f1f1f1",
              color: mode === "login" ? "#fff" : "#333",
              fontWeight: 700
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError("") }}
            style={{
              flex: 1,
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              background: mode === "signup" ? "#ff7a00" : "#f1f1f1",
              color: mode === "signup" ? "#fff" : "#333",
              fontWeight: 700
            }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div style={{
            background: "#fff0f0",
            color: "#c62828",
            padding: "12px 14px",
            borderRadius: "10px",
            marginBottom: "18px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <label style={{ display: "block", marginBottom: "7px", fontWeight: 600 }}>Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />
            </>
          )}

          <label style={{ display: "block", marginBottom: "7px", fontWeight: 600 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />

          <label style={{ display: "block", marginBottom: "7px", fontWeight: 600 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            style={inputStyle}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#ff7a00",
              color: "white",
              fontWeight: 700,
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? .7 : 1
            }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Login to ITSoft" : "Create Account"}
          </button>
        </form>

        {mode === "login" && (
          <p style={{ textAlign: "center", color: "#888", fontSize: "13px", marginTop: "18px" }}>
            Test account: test@example.com / Test@12345
          </p>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #ddd",
  borderRadius: "10px",
  marginBottom: "18px",
  fontSize: "15px",
  outline: "none"
}

// =============================
// APP
// =============================

function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [user, setUser] = useState(null)
  const [page, setPage] = useState("dashboard")

  const menu = [
    ["dashboard", "🏠", "Dashboard"],
    ["customers", "👥", "Customers"],
    ["appointments", "📅", "Appointments"],
    ["orders", "🛍️", "Orders / Services"],
    ["billing", "💰", "Billing"],
    ["reports", "📊", "Reports"],
    ["ai", "🤖", "AI Assistant"],
    ["settings", "⚙️", "Settings"]
  ]

  useEffect(() => {
    const handleAuthExpired = () => {
      setAuthenticated(false)
      setUser(null)
      setPage("dashboard")
    }

    window.addEventListener("auth-expired", handleAuthExpired)

    const token = localStorage.getItem("token")

    if (!token) {
      setCheckingAuth(false)
      return
    }

    apiRequest("/api/auth/me")
      .then(data => {
        setUser(data)
        setAuthenticated(true)
      })
      .catch(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setAuthenticated(false)
      })
      .finally(() => setCheckingAuth(false))

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired)
    }
  }, [])

  const handleLogin = loggedInUser => {
    setUser(loggedInUser)
    setAuthenticated(true)
    setPage("dashboard")
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setAuthenticated(false)
    setUser(null)
  }

  if (checkingAuth) {
    return <div className="auth-loading">Checking login...</div>
  }

  if (!authenticated) {
    return <AuthScreen onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-mark">IS</div>
          <div>
            <h2>ITSoft</h2>
            <p>AI Business Manager</p>
          </div>
        </div>

        <nav>
          <p className="nav-label">MAIN MENU</p>
          {menu.map(item => (
            <button
              key={item[0]}
              className={page === item[0] ? "active" : ""}
              onClick={() => setPage(item[0])}
            >
              <span>{item[1]}</span>
              {item[2]}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span>🤖</span>
            <div>
              <strong>AI Assistant</strong>
              <small>Connected to backend</small>
            </div>
          </div>

          <button className="sidebar-user" onClick={logout} title="Logout">
            <div className="user-avatar">{(user?.name || "A").charAt(0).toUpperCase()}</div>
            <div>
              <strong>{user?.name || "Aanchal"}</strong>
              <small>Logout</small>
            </div>
            <span>↪</span>
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <strong>ITSoft</strong>
            <span> / {menu.find(item => item[0] === page)?.[2]}</span>
          </div>

          <div className="topbar-user">
            <div className="user-avatar">{(user?.name || "A").charAt(0).toUpperCase()}</div>
            <div>
              <strong>{user?.name || "Aanchal"}</strong>
              <small>{user?.email || "Administrator"}</small>
            </div>
          </div>
        </header>

        {page === "dashboard" && <Dashboard setPage={setPage} />}
        {page === "customers" && <Customers />}
        {page === "appointments" && <Appointments />}
        {page === "orders" && <Orders />}
        {page === "billing" && <Billing />}
        {page === "reports" && <Reports />}
        {page === "ai" && <AIAssistant />}
        {page === "settings" && <Settings />}
      </main>
    </div>
  )
}

export default App 
