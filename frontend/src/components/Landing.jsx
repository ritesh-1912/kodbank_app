import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  const features = [
    {
      title: "Check Balance",
      description:
        "View your balance instantly. Toggle visibility with Show or Hide for privacy.",
      icon: "◆",
    },
    {
      title: "Send Money",
      description:
        "Transfer to any Kodbank user by username or UID. Add an optional note.",
      icon: "↔",
    },
    {
      title: "Cards",
      description:
        "Manage debit and credit cards. Add Visa or Mastercard with one click.",
      icon: "◇",
    },
    {
      title: "KodAI Assistant",
      description:
        "Get help anytime. Ask about balance, transfers, UID, or how to use the app.",
      icon: "✦",
    },
  ];

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link to="/" className="landing-logo">
            <span className="landing-logo-icon">K</span>
            <span className="landing-logo-text">Kodbank</span>
          </Link>
          <nav className="landing-nav">
            <Link to="/login" className="landing-nav-link">
              Sign in
            </Link>
            <Link to="/register" className="landing-nav-btn">
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-glow" aria-hidden="true" />
          <h1 className="landing-hero-title">
            Banking that’s <span className="landing-hero-accent">simple</span> and <span className="landing-hero-accent">secure</span>
          </h1>
          <p className="landing-hero-sub">
            Open an account in minutes. Check your balance, send money, and
            manage cards—all in one place.
          </p>
          <div className="landing-hero-cta">
            <Link to="/register" className="landing-cta-primary">
              Create account
            </Link>
            <Link to="/login" className="landing-cta-secondary">
              Sign in
            </Link>
          </div>
        </section>

        <section className="landing-features">
          <h2 className="landing-section-title">Everything you need</h2>
          <div className="landing-features-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className="landing-feature-card"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-trust">
          <div className="landing-trust-inner">
            <div className="landing-trust-item">
              <span className="landing-trust-dot" />
              <span>Unique Customer ID (UID) for every account</span>
            </div>
            <div className="landing-trust-item">
              <span className="landing-trust-dot" />
              <span>Secure sign-in with session cookies</span>
            </div>
            <div className="landing-trust-item">
              <span className="landing-trust-dot" />
              <span>Transaction history and filters</span>
            </div>
          </div>
        </section>

        <section className="landing-cta-section">
          <div className="landing-cta-card">
            <h2 className="landing-cta-card-title">Ready to get started?</h2>
            <p className="landing-cta-card-sub">
              Create your free account and start banking in minutes.
            </p>
            <div className="landing-cta-card-buttons">
              <Link to="/register" className="landing-cta-primary">
                Create account
              </Link>
              <Link to="/login" className="landing-cta-secondary">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span className="landing-logo-text">Kodbank</span>
          <span className="landing-footer-sep">·</span>
          <Link to="/login" className="landing-footer-link">
            Sign in
          </Link>
          <span className="landing-footer-sep">·</span>
          <Link to="/register" className="landing-footer-link">
            Create account
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
