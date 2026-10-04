function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "📝",
      title: "Set Up Your Business",
      text: "Add your business information and configure the basic details you need to get started."
    },
    {
      number: "02",
      icon: "👥",
      title: "Add Customers",
      text: "Create customer profiles and keep their important information organized."
    },
    {
      number: "03",
      icon: "⚙️",
      title: "Manage Daily Operations",
      text: "Create appointments, manage services, track orders and handle your billing."
    },
    {
      number: "04",
      icon: "📊",
      title: "Understand Your Business",
      text: "Use reports and analytics to see revenue, orders, customers and appointments."
    },
    {
      number: "05",
      icon: "🤖",
      title: "Ask AI",
      text: "Use the AI Business Assistant to ask questions about your current business data."
    }
  ]

  return (
    <div className="public-page">

      <section className="inner-hero">

        <div className="hero-badge">
          <span>✦</span>
          HOW IT WORKS
        </div>

        <h1>
          From everyday tasks
          <br />
          <span>to intelligent insights.</span>
        </h1>

        <p>
          ITSoft connects the important parts of your business
          so you can manage everything from one place.
        </p>

      </section>

      <section className="public-section">

        <div className="process-timeline">

          {steps.map((step, index) => (
            <div className="process-step" key={step.number}>

              <div className="process-number">
                {step.number}
              </div>

              <div className="process-line">
                {index !== steps.length - 1 && <span />}
              </div>

              <div className="process-content">

                <div className="process-icon">
                  {step.icon}
                </div>

                <h2>{step.title}</h2>

                <p>{step.text}</p>

              </div>

            </div>
          ))}

        </div>

      </section>

      <section className="workflow-section">

        <div className="workflow-card">

          <div className="workflow-header">
            <span>ITSOFT WORKFLOW</span>
            <span>● Connected</span>
          </div>

          <div className="workflow-flow">

            <div className="workflow-node">
              <span>👥</span>
              Customers
            </div>

            <div className="workflow-arrow">→</div>

            <div className="workflow-node">
              <span>⚙️</span>
              Operations
            </div>

            <div className="workflow-arrow">→</div>

            <div className="workflow-node">
              <span>📊</span>
              Analytics
            </div>

            <div className="workflow-arrow">→</div>

            <div className="workflow-node highlight">
              <span>🤖</span>
              AI Insights
            </div>

          </div>

        </div>

      </section>

    </div>
  )
}

export default HowItWorks