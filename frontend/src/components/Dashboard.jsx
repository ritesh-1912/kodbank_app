import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { checkBalance, getCards, getTransactions, transfer as apiTransfer, addCard as apiAddCard, askKodAI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [error, setError] = useState('');
  const [balanceVisible, setBalanceVisible] = useState(false);

  /* Send Money modal */
  const [sendMoneyOpen, setSendMoneyOpen] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');

  /* Add Card modal */
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addCardType, setAddCardType] = useState('debit');
  const [addCardBrand, setAddCardBrand] = useState('Visa');
  const [addCardLoading, setAddCardLoading] = useState(false);
  const [addCardError, setAddCardError] = useState('');

  /* Transaction filters */
  const [txFilterType, setTxFilterType] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [txSearchDebounced, setTxSearchDebounced] = useState('');

  /* Ask KodAI */
  const [askKodAIOpen, setAskKodAIOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const loadBalance = useCallback(async () => {
    try {
      const res = await checkBalance();
      if (res && res.balance != null) {
        setBalance(Number(res.balance));
        setBalanceVisible(true);
      }
    } catch (e) {
      if (e.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

  const loadCards = useCallback(async () => {
    setLoadingCards(true);
    try {
      const r = await getCards();
      setCards(r.cards || []);
    } catch (e) {
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const params = { limit: 25 };
      if (txFilterType === 'credit' || txFilterType === 'debit') params.type = txFilterType;
      if (txSearchDebounced.trim()) params.search = txSearchDebounced.trim();
      const r = await getTransactions(params);
      setTransactions(r.transactions || []);
    } catch (e) {
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }, [txFilterType, txSearchDebounced]);

  useEffect(() => {
    const t = setTimeout(() => setTxSearchDebounced(txSearch), 400);
    return () => clearTimeout(t);
  }, [txSearch]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [balRes, cardsRes] = await Promise.all([
          checkBalance().catch(() => ({ balance: null })),
          getCards().then(r => r.cards || []).catch(() => [])
        ]);
        if (mounted) {
          if (balRes && balRes.balance != null) {
            setBalance(Number(balRes.balance));
            setBalanceVisible(true);
          }
          setCards(Array.isArray(cardsRes) ? cardsRes : []);
        }
      } catch (e) {
        if (mounted) setError('Failed to load data.');
        if (e.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
      } finally {
        if (mounted) setLoadingCards(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (txFilterType || txSearchDebounced !== undefined) loadTransactions();
  }, [txFilterType, txSearchDebounced, loadTransactions]);

  useEffect(() => {
    if (balance !== null && balance !== undefined) triggerConfetti();
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
    setBalanceVisible(false);
    try {
      const response = await checkBalance();
      setBalance(Number(response.balance));
      setBalanceVisible(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance. Please try again.');
      if (err.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const toggleBalanceVisibility = () => setBalanceVisible(v => !v);

  const openSendMoney = () => {
    setSendMoneyOpen(true);
    setTransferTo('');
    setTransferAmount('');
    setTransferNote('');
    setTransferError('');
    setTransferSuccess('');
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const to = transferTo.trim();
    const amount = parseFloat(transferAmount);
    if (!to) {
      setTransferError('Enter recipient username or UID.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setTransferError('Enter a valid amount.');
      return;
    }
    setTransferLoading(true);
    setTransferError('');
    setTransferSuccess('');
    try {
      const body = { amount };
      if (/^\d+$/.test(to)) body.toUid = parseInt(to, 10);
      else body.toUsername = to;
      if (transferNote.trim()) body.note = transferNote.trim();
      const res = await apiTransfer(body);
      setTransferSuccess(res.message || 'Transfer successful.');
      await loadBalance();
      await loadTransactions();
      setTimeout(() => {
        setSendMoneyOpen(false);
        setTransferSuccess('');
      }, 1500);
    } catch (err) {
      setTransferError(err.response?.data?.message || 'Transfer failed.');
    } finally {
      setTransferLoading(false);
    }
  };

  const openAddCard = () => {
    setAddCardOpen(true);
    setAddCardType('debit');
    setAddCardBrand('Visa');
    setAddCardError('');
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    setAddCardLoading(true);
    setAddCardError('');
    try {
      const res = await apiAddCard({ cardType: addCardType, brand: addCardBrand });
      setCards(prev => [...prev, { id: res.card?.id, last_four: res.card?.last_four, cardType: res.card?.cardType || addCardType, brand: res.card?.brand || addCardBrand }]);
      setAddCardOpen(false);
    } catch (err) {
      setAddCardError(err.response?.data?.message || 'Failed to add card.');
    } finally {
      setAddCardLoading(false);
    }
  };

  const openAskKodAI = () => {
    setAskKodAIOpen(true);
    setAiMessages([]);
    setAiMessage('');
    setAiError('');
  };

  const handleSendKodAI = async (e) => {
    e.preventDefault();
    const text = aiMessage.trim();
    if (!text || aiLoading) return;
    setAiError('');
    setAiMessages(prev => [...prev, { role: 'user', text }]);
    setAiMessage('');
    setAiLoading(true);
    try {
      const res = await askKodAI({ message: text });
      setAiMessages(prev => [...prev, { role: 'assistant', text: res.reply || 'No reply.' }]);
    } catch (err) {
      const msg = err.response?.data?.message || 'KodAI is unavailable. Try again.';
      setAiError(msg);
      if (err.response?.status === 401) setTimeout(() => navigate('/login'), 2000);
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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
          <Link to="/dashboard" className="bank-nav-item">
            <span className="bank-nav-icon">◇</span>
            Cards
          </Link>
          <Link to="/dashboard" className="bank-nav-item">
            <span className="bank-nav-icon">↔</span>
            Transactions
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
            <p className="bank-welcome-sub">Here’s your financial overview.</p>
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
            <button type="button" className="bank-btn bank-btn-primary" onClick={openSendMoney}>
              Send Money
            </button>
            <button type="button" className="bank-btn bank-btn-kodai" onClick={openAskKodAI}>
              Ask KodAI
            </button>
          </div>
        </header>

        <div className="bank-content">
          <section className="bank-section bank-section-balance">
            <div className="bank-card bank-card-balance">
              <div className="bank-card-glow" />
              <div className="bank-card-header">
                <span className="bank-card-label">Total Balance</span>
                {balance !== null && balance !== undefined && (
                  <button
                    type="button"
                    onClick={toggleBalanceVisibility}
                    className="bank-balance-toggle"
                    aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
                  >
                    {balanceVisible ? 'Hide' : 'Show'}
                  </button>
                )}
              </div>
              {error && <div className="bank-error-msg">{error}</div>}
              {balance !== null && balance !== undefined && (
                <div className="bank-balance-value">
                  {balanceVisible ? `₹${Number(balance).toLocaleString('en-IN')}` : '₹••••••••'}
                </div>
              )}
              {(balance === null || balance === undefined) && !error && (
                <p className="bank-card-hint">Click “Check Balance” to see your balance.</p>
              )}
            </div>
          </section>

          <section className="bank-section bank-section-cards">
            <div className="bank-section-head">
              <h2 className="bank-section-title">My Cards</h2>
              <button type="button" className="bank-btn bank-btn-ghost" onClick={openAddCard}>
                + Add card
              </button>
            </div>
            {loadingCards ? (
              <div className="bank-cards-skeleton">
                <div className="bank-card-visual bank-card-skeleton" />
                <div className="bank-card-visual bank-card-skeleton" />
              </div>
            ) : cards.length === 0 ? (
              <p className="bank-empty">No cards yet. Add a card or register to get your first one.</p>
            ) : (
              <div className="bank-cards-list">
                {cards.map((card, i) => (
                  <div
                    key={card.id || i}
                    className="bank-card-visual"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="bank-card-visual-shine" />
                    <div className="bank-card-visual-chip" />
                    <div className="bank-card-visual-number">•••• •••• •••• {card.last_four || '****'}</div>
                    <div className="bank-card-visual-footer">
                      <span className="bank-card-visual-type">{(card.cardType || 'debit').toUpperCase()}</span>
                      <span className="bank-card-visual-brand">{card.brand || 'Visa'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bank-section bank-section-transactions">
            <div className="bank-section-head">
              <h2 className="bank-section-title">Recent Transactions</h2>
              <div className="bank-tx-filters">
                <select
                  className="bank-tx-filter-select"
                  value={txFilterType}
                  onChange={(e) => setTxFilterType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
                <input
                  type="text"
                  className="bank-tx-filter-search"
                  placeholder="Search..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                />
              </div>
            </div>
            {loadingTx ? (
              <div className="bank-tx-skeleton">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="bank-tx-row bank-tx-skeleton-row" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="bank-empty">No transactions yet.</p>
            ) : (
              <div className="bank-tx-list">
                {transactions.map((tx, i) => (
                  <div
                    key={tx.id || i}
                    className="bank-tx-row"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className={`bank-tx-icon bank-tx-icon-${tx.type}`}>
                      {tx.type === 'credit' ? '↓' : '↑'}
                    </div>
                    <div className="bank-tx-detail">
                      <span className="bank-tx-desc">{tx.description || '—'}</span>
                      <span className="bank-tx-date">{formatDate(tx.createdAt)}</span>
                    </div>
                    <span className={`bank-tx-amount bank-tx-amount-${tx.type}`}>
                      {tx.type === 'credit' ? '+' : '−'}₹{Math.abs(Number(tx.amount)).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Send Money modal */}
      {sendMoneyOpen && (
        <div className="bank-modal-overlay" onClick={() => !transferLoading && setSendMoneyOpen(false)}>
          <div className="bank-modal" onClick={e => e.stopPropagation()}>
            <div className="bank-modal-header">
              <h3>Send Money</h3>
              <button type="button" className="bank-modal-close" onClick={() => !transferLoading && setSendMoneyOpen(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleTransfer} className="bank-modal-form">
              <div className="form-group">
                <label>Recipient (username or UID)</label>
                <input
                  type="text"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="e.g. jane_doe or 5"
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="What's this for?"
                />
              </div>
              {transferError && <div className="bank-modal-error">{transferError}</div>}
              {transferSuccess && <div className="bank-modal-success">{transferSuccess}</div>}
              <div className="bank-modal-actions">
                <button type="button" className="bank-btn bank-btn-secondary" onClick={() => setSendMoneyOpen(false)} disabled={transferLoading}>
                  Cancel
                </button>
                <button type="submit" className="bank-btn bank-btn-primary" disabled={transferLoading}>
                  {transferLoading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ask KodAI modal */}
      {askKodAIOpen && (
        <div className="bank-modal-overlay" onClick={() => !aiLoading && setAskKodAIOpen(false)}>
          <div className="bank-modal bank-modal-chat" onClick={e => e.stopPropagation()}>
            <div className="bank-modal-header">
              <h3>KodAI</h3>
              <button type="button" className="bank-modal-close" onClick={() => !aiLoading && setAskKodAIOpen(false)} aria-label="Close">×</button>
            </div>
            <div className="bank-chat-body">
              <div className="bank-chat-messages">
                {aiMessages.length === 0 && (
                  <p className="bank-chat-placeholder">Ask me anything about Kodbank: balance, transfers, cards, UID, or how to use the app.</p>
                )}
                {aiMessages.map((m, i) => (
                  <div key={i} className={`bank-chat-bubble bank-chat-bubble-${m.role}`}>
                    <span className="bank-chat-bubble-label">{m.role === 'user' ? 'You' : 'KodAI'}</span>
                    <span className="bank-chat-bubble-text">{m.text}</span>
                  </div>
                ))}
                {aiLoading && (
                  <div className="bank-chat-bubble bank-chat-bubble-assistant">
                    <span className="bank-chat-bubble-label">KodAI</span>
                    <span className="bank-chat-bubble-text bank-chat-typing">Thinking...</span>
                  </div>
                )}
              </div>
              {aiError && <div className="bank-modal-error bank-chat-error">{aiError}</div>}
              <form onSubmit={handleSendKodAI} className="bank-chat-form">
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Type your question..."
                  className="bank-chat-input"
                  disabled={aiLoading}
                  autoComplete="off"
                />
                <button type="submit" className="bank-btn bank-btn-primary bank-chat-send" disabled={aiLoading || !aiMessage.trim()}>
                  Send
                </button>
              </form>
              <p className="bank-chat-powered-footer">Powered by Hugging Face</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Card modal */}
      {addCardOpen && (
        <div className="bank-modal-overlay" onClick={() => !addCardLoading && setAddCardOpen(false)}>
          <div className="bank-modal" onClick={e => e.stopPropagation()}>
            <div className="bank-modal-header">
              <h3>Add Card</h3>
              <button type="button" className="bank-modal-close" onClick={() => !addCardLoading && setAddCardOpen(false)} aria-label="Close">×</button>
            </div>
            <form onSubmit={handleAddCard} className="bank-modal-form">
              <div className="form-group">
                <label>Card type</label>
                <select value={addCardType} onChange={(e) => setAddCardType(e.target.value)}>
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Brand</label>
                <select value={addCardBrand} onChange={(e) => setAddCardBrand(e.target.value)}>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                </select>
              </div>
              {addCardError && <div className="bank-modal-error">{addCardError}</div>}
              <div className="bank-modal-actions">
                <button type="button" className="bank-btn bank-btn-secondary" onClick={() => setAddCardOpen(false)} disabled={addCardLoading}>
                  Cancel
                </button>
                <button type="submit" className="bank-btn bank-btn-primary" disabled={addCardLoading}>
                  {addCardLoading ? 'Adding...' : 'Add card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
