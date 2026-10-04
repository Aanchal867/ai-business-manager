function Pricing({ onLogin }) {
  const plans = [
    {
      name: "Starter",
      price: "₹499",
      description: "For small businesses getting started.",
      features: [
        "Customer management",
        "Appointments",
        "Services",
        "Orders",
        "Basic dashboard"
      ]
    },
    {
      name: "Professional",
      price: "₹999",
      description: "For businesses that need deeper control.",
      popular: true,
      features: [
        "Everything in Starter",
        "Billing & invoices",
        "Reports & analytics",
        "AI Business Assistant",
        "Advanced insights"
      ]
    },
    {
      name: "Business",
      price: "Custom",
      description: "For businesses with specific requirements.",
      features: [
        "Custom features",
        "Business-specific setup",
        "Custom integrations",
        "Dedicated support",
        "Flexible configuration"
      ]
    }
  ]

  return (
    <div className="public-page">

      <section className="inner-hero pricing-hero">

        <div className="hero-badge">
          <span>✦</span>
          SIMPLE PRICING
        </div>

        <h1>
          Choose the setup
          <br />
          <span>that fits your business.</span>
        </h1>

        <p>
          Start with the tools you need and scale as your business grows.
        </p>

      </section>

      <section className="public-section">

        <div className="pricing-grid">

          {plans.map(plan => (
            <div
              className={`pricing-card ${
                plan.popular ? "popular" : ""
              }`}
              key={plan.name}
            >

              {plan.popular && (
                <div className="popular-badge">
                  MOST POPULAR
                </div>
              )}

              <div className="pricing-icon">
                {plan.name === "Starter"
                  ? "🌱"
                  : plan.name === "Professional"
                  ? "⚡"
                  : "🏢"}
              </div>

              <h2>{plan.name}</h2>

              <p className="pricing-description">
                {plan.description}
              </p>

              <div className="price">
                {plan.price !== "Custom" && (
                  <span className="currency">₹</span>
                )}

                {plan.price.replace("₹", "")}

                {plan.price !== "Custom" && (
                  <small>/month</small>
                )}
              </div>

              <div className="pricing-divider" />

              <ul>
                {plan.features.map(feature => (
                  <li key={feature}>
                    <span>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={
                  plan.popular
                    ? "public-primary-button"
                    : "pricing-outline-button"
                }
                onClick={onLogin}
              >
                {plan.name === "Business"
                  ? "Contact Us"
                  : "Get Started"}
              </button>

            </div>
          ))}

        </div>

        <p className="pricing-note">
          Pricing shown above is proposed website pricing and can be
          customized according to your final business model.
        </p>

      </section>

    </div>
  )
}

export default Pricing