import { useEffect, useState } from "react"

function Home({ onLogin }) {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: "👥",
      title: "Customer Management",
      text: "Keep customer information organized and accessible from one simple dashboard."
    },
    {
      icon: "📅",
      title: "Appointments",
      text: "Manage appointments, schedules and statuses without unnecessary complexity."
    },
    {
      icon: "💰",
      title: "Billing & Revenue",
      text: "Track invoices, payments and revenue in one connected business system."
    },
    {
      icon: "📊",
      title: "Reports & Analytics",
      text: "Understand your business performance through clear reports and useful insights."
    },
    {
      icon: "🤖",
      title: "AI Business Assistant",
      text: "Ask questions about your business data and get useful AI-powered insights."
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length)
    }, 3500)

    return () => clearInterval(timer)
  }, [features.length])

  return (
    <div className="public-page">

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">

          <div className="hero-badge">
            <span>✦</span>
            AI-Powered Business Management
          </div>

          <h1>
            Run Your Business
            <br />
            <span>Smarter with AI.</span>
          </h1>

          <p className="hero-description">
            Manage customers, appointments, services, orders, billing and
            business insights from one powerful platform.
          </p>

          <div className="hero-buttons">
            <button className="public-primary-button" onClick={onLogin}>
              Login to Dashboard
              <span>→</span>
            </button>

            <a href="#features" className="public-secondary-button">
              Explore Features
            </a>
          </div>

          <div className="hero-trust">
            <span>✓</span> Simple to use
            <span>✓</span> Secure access
            <span>✓</span> AI-powered insights
          </div>

        </div>

        <div className="hero-dashboard">

          <div className="dashboard-window">

            <div className="window-top">
              <div className="window-dots">
                <span />
                <span />
                <span />
              </div>

              <div className="window-title">
                ITSoft · AI Business Manager
              </div>
            </div>

            <div className="mini-dashboard">

              <div className="mini-sidebar">
                <div className="mini-logo">IS</div>

                <div className="mini-menu active">⌂</div>
                <div className="mini-menu">♙</div>
                <div className="mini-menu">◷</div>
                <div className="mini-menu">▣</div>
                <div className="mini-menu">₹</div>
                <div className="mini-menu">◩</div>
              </div>

              <div className="mini-main">

                <div className="mini-header">
                  <div>
                    <small>Good morning</small>
                    <h3>Business Overview</h3>
                  </div>

                  <div className="mini-user">
                    A
                  </div>
                </div>

                <div className="mini-cards">

                  <div className="mini-card">
                    <span>Total Customers</span>
                    <strong>248</strong>
                    <small className="positive">↑ 12.5%</small>
                  </div>

                  <div className="mini-card">
                    <span>Revenue</span>
                    <strong>₹84.2K</strong>
                    <small className="positive">↑ 8.4%</small>
                  </div>

                  <div className="mini-card">
                    <span>Orders</span>
                    <strong>126</strong>
                    <small className="positive">↑ 6.2%</small>
                  </div>

                </div>

                <div className="mini-content-grid">

                  <div className="mini-chart-card">

                    <div className="mini-card-heading">
                      <span>Revenue Overview</span>
                      <span>Monthly ▾</span>
                    </div>

                    <div className="fake-chart">
                      <div className="chart-line line-one" />
                      <div className="chart-line line-two" />
                      <div className="chart-line line-three" />
                      <div className="chart-dot dot-one" />
                      <div className="chart-dot dot-two" />
                      <div className="chart-dot dot-three" />
                    </div>

                  </div>

                  <div className="mini-ai-card">

                    <div className="mini-ai-icon">
                      🤖
                    </div>

                    <span>AI INSIGHT</span>

                    <h4>
                      Revenue is trending upward this month.
                    </h4>

                    <p>
                      Your business generated 18% more revenue than the
                      previous month.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* LOGO / INTRO STRIP */}
      <section className="intro-strip">
        <p>
          Everything you need to manage your business,
          <strong> in one place.</strong>
        </p>
      </section>

      {/* FEATURES */}
      <section className="public-section features-section" id="features">

        <div className="section-heading">
          <span className="eyebrow">POWERFUL FEATURES</span>

          <h2>
            Your business.
            <br />
            <span>One intelligent platform.</span>
          </h2>

          <p>
            From your first customer to your latest invoice, ITSoft helps
            you manage the everyday operations of your business.
          </p>
        </div>

        <div className="feature-showcase">

          <div className="feature-list">

            {features.map((feature, index) => (
              <button
                key={feature.title}
                className={`feature-item ${
                  activeFeature === index ? "active" : ""
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <span className="feature-item-icon">
                  {feature.icon}
                </span>

                <span>
                  <strong>{feature.title}</strong>
                  <small>{feature.text}</small>
                </span>

                <span className="feature-arrow">
                  →
                </span>
              </button>
            ))}

          </div>

          <div className="feature-visual">

            <div className="feature-visual-glow" />

            <div className="feature-visual-card">

              <div className="feature-visual-top">
                <span>
                  {features[activeFeature].icon}
                </span>

                <span>
                  {String(activeFeature + 1).padStart(2, "0")}
                </span>
              </div>

              <h3>
                {features[activeFeature].title}
              </h3>

              <p>
                {features[activeFeature].text}
              </p>

              <div className="visual-stat-row">
                <div>
                  <strong>24/7</strong>
                  <span>Access</span>
                </div>

                <div>
                  <strong>100%</strong>
                  <span>Connected</span>
                </div>

                <div>
                  <strong>AI</strong>
                  <span>Powered</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="public-section how-section" id="how-it-works">

        <div className="section-heading center">

          <span className="eyebrow">
            HOW IT WORKS
          </span>

          <h2>
            Simple business management.
            <br />
            <span>Powerful results.</span>
          </h2>

          <p>
            Everything is designed to keep your daily business operations
            simple and organized.
          </p>

        </div>

        <div className="steps-grid">

          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">📝</div>
            <h3>Add Your Data</h3>
            <p>
              Add your customers, services and business information
              to the system.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">⚙️</div>
            <h3>Manage Operations</h3>
            <p>
              Handle appointments, orders, services and billing
              from one dashboard.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">📈</div>
            <h3>Track Performance</h3>
            <p>
              Monitor revenue, customers, orders and business
              performance through reports.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon">🤖</div>
            <h3>Get AI Insights</h3>
            <p>
              Ask questions about your business and turn your
              data into useful insights.
            </p>
          </div>

        </div>

      </section>

      {/* AI SECTION */}
      <section className="ai-public-section">

        <div className="ai-public-content">

          <div className="ai-public-badge">
            🤖 AI BUSINESS ASSISTANT
          </div>

          <h2>
            Your business data.
            <br />
            <span>Now you can talk to it.</span>
          </h2>

          <p>
            Instead of searching through reports, simply ask your
            business assistant what you want to know.
          </p>

          <div className="ai-question">
            <span>“</span>
            How much revenue did we generate this month?
            <span>”</span>
          </div>

          <div className="ai-answer">
            <div className="ai-answer-icon">
              ✦
            </div>

            <div>
              <strong>AI Assistant</strong>
              <p>
                Your business generated ₹84,200 this month,
                which is 18% higher than the previous month.
              </p>
            </div>
          </div>

        </div>

        <div className="ai-orb">
          <div className="ai-orb-inner">
            ✦
          </div>

          <div className="ai-orbit orbit-one" />
          <div className="ai-orbit orbit-two" />
          <div className="ai-orbit orbit-three" />
        </div>

      </section>

      {/* CTA */}
      <section className="public-cta">

        <div>
          <span className="eyebrow">
            READY TO GET STARTED?
          </span>

          <h2>
            Manage your business.
            <br />
            <span>Work smarter.</span>
          </h2>

          <p>
            Access your AI Business Manager and keep everything
            under control from one place.
          </p>
        </div>

        <button
          className="public-primary-button large"
          onClick={onLogin}
        >
          Login to ITSoft
          <span>→</span>
        </button>

      </section>

    </div>
  )
}

export default Home