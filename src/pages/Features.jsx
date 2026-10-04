function Features() {
  const features = [
    {
      icon: "👥",
      title: "Customer Management",
      text: "Keep your customer information organized and easily accessible.",
      points: [
        "Customer profiles",
        "Contact information",
        "Search customers",
        "Customer history"
      ]
    },
    {
      icon: "📅",
      title: "Appointment Management",
      text: "Keep your schedule organized and never lose track of appointments.",
      points: [
        "Create appointments",
        "Track appointment status",
        "Customer linking",
        "Upcoming appointments"
      ]
    },
    {
      icon: "🛍️",
      title: "Orders & Services",
      text: "Manage your services, pricing and customer orders from one place.",
      points: [
        "Service management",
        "Order tracking",
        "Quantity management",
        "Automatic totals"
      ]
    },
    {
      icon: "💰",
      title: "Billing & Invoices",
      text: "Track invoices, payments and outstanding amounts with clarity.",
      points: [
        "Create invoices",
        "Paid / unpaid tracking",
        "Revenue tracking",
        "Order-linked invoices"
      ]
    },
    {
      icon: "📊",
      title: "Reports & Analytics",
      text: "Understand your business performance using meaningful data.",
      points: [
        "Revenue reports",
        "Order analytics",
        "Appointment analytics",
        "Business summaries"
      ]
    },
    {
      icon: "🤖",
      title: "AI Business Assistant",
      text: "Ask questions about your business data and get useful answers.",
      points: [
        "Business summaries",
        "Revenue questions",
        "Customer insights",
        "Data-driven answers"
      ]
    }
  ]

  return (
    <div className="public-page">

      <section className="inner-hero">

        <div className="hero-badge">
          <span>✦</span>
          POWERFUL FEATURES
        </div>

        <h1>
          Everything you need
          <br />
          <span>to run your business.</span>
        </h1>

        <p>
          ITSoft brings your everyday business operations together
          in one simple, intelligent platform.
        </p>

      </section>

      <section className="public-section">

        <div className="feature-grid-page">

          {features.map((feature, index) => (
            <div className="large-feature-card" key={feature.title}>

              <div className="large-feature-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="large-feature-icon">
                {feature.icon}
              </div>

              <h2>{feature.title}</h2>

              <p>{feature.text}</p>

              <ul>
                {feature.points.map(point => (
                  <li key={point}>
                    <span>✓</span>
                    {point}
                  </li>
                ))}
              </ul>

            </div>
          ))}

        </div>

      </section>

      <section className="feature-bottom-cta">

        <div>
          <span className="eyebrow">
            ONE PLATFORM
          </span>

          <h2>
            Less complexity.
            <br />
            <span>More control.</span>
          </h2>
        </div>

        <p>
          Keep your customers, operations, payments and business
          insights connected without jumping between multiple tools.
        </p>

      </section>

    </div>
  )
}

export default Features