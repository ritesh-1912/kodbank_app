import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { checkBalance } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (balance !== null) triggerConfetti();
  }, [balance]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min, max) => Math.random() * (max - min) + min;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
    setTimeout(() => {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 100);
  };

  const handleCheckBalance = async () => {
    setLoading(true);
    setError('');
    setBalance(null);
    try {
      const response = await checkBalance();
      setBalance(response.balance);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance. Please try again.');
      if (err.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-dashboard">
      <aside className="bank-sidebar">
        <div className="bank-sidebar-logo">
          <span className="bank-logo-icon">K</span>
          <span className="bank-logo-text">Kodbank</span>
        </div>
        <nav className="bank-nav">
          <Link to="/dashboard" className="bank-nav-item active">
            <span className="bank-nav-icon">⌂</span>
            Dashboard
          </Link>
        </nav>
        <div className="bank-sidebar-footer">
          <Link to="/login" className="bank-nav-item">
            <span className="bank-nav-icon">→</span>
            Logout
          </Link>
        </div>
      </aside>

      <main className="bank-main">
        <header className="bank-header">
          <div>
            <h1 className="bank-welcome">Welcome back</h1>
            <p className="bank-welcome-sub">Here's what's happening with your finance today.</p>
          </div>
          <div className="bank-header-actions">
            <button
              type="button"
              onClick={handleCheckBalance}
              className="bank-btn bank-btn-secondary"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Check Balance'}
            </button>
            <span className="bank-btn bank-btn-primary">Send Money</span>
          </div>
        </header>

        <div className="bank-content">
          <div className="bank-card bank-card-balance">
            <div className="bank-card-header">
              <span className="bank-card-label">Total Balance</span>
              {balance !== null && (
                <span className="bank-badge bank-badge-success">Updated</span>
              )}
            </div>
            {error && (
              <div className="bank-error-msg">{error}</div>
            )}
            {balance !== null && (
              <div className="bank-balance-value">₹{Number(balance).toLocaleString('en-IN')}</div>
            )}
            {balance === null && !error && (
              <p className="bank-card-hint">Click “Check Balance” to see your balance.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
