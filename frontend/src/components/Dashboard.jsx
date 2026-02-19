import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { checkBalance } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Trigger confetti animation when balance is displayed
    if (balance !== null) {
      triggerConfetti();
    }
  }, [balance]);

  const triggerConfetti = () => {
    // Create a wonderful party popper animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Additional burst effect
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
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
      const errorMessage = err.response?.data?.message || 'Failed to fetch balance. Please try again.';
      setError(errorMessage);
      
      // If unauthorized, redirect to login
      if (err.response?.status === 401) {
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome to Kodbank Dashboard</h1>
        <p className="welcome-text">Manage your account and check your balance</p>

        <div className="balance-section">
          <button 
            onClick={handleCheckBalance} 
            className="balance-btn"
            disabled={loading}
          >
            {loading ? 'Checking Balance...' : 'Check Balance'}
          </button>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {balance !== null && (
            <div className="balance-display">
              <div className="balance-label">Your balance is:</div>
              <div className="balance-amount">₹{balance.toLocaleString('en-IN')}</div>
              <div className="balance-celebration">🎉</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
