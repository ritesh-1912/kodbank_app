import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Phone: allow only digits
    const nextValue = name === 'phone' ? value.replace(/\D/g, '') : value;
    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must contain only numbers';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      await register(formData);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (error) {
      const data = error.response?.data;
      const isHtml = typeof data === 'string' && data.includes('Serverless Function');
      let errorMessage;
      if (!error.response) {
        errorMessage = 'Cannot reach server. Check deployment and try again.';
      } else if (isHtml && error.response?.status === 500) {
        errorMessage = 'Server error: API crashed. Check Vercel env vars (DB_*, JWT_SECRET) and redeploy.';
      } else {
        errorMessage = data?.message || data?.errors?.[0]?.msg || 'Registration failed. Please try again.';
        if (data?.hint) errorMessage += ` — ${data.hint}`;
        else if (data?.code) errorMessage += ` [${data.code}]`;
      }
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page bank-theme">
      <aside className="auth-sidebar">
        <div className="auth-sidebar-logo">
          <span className="auth-logo-icon">K</span>
          <span className="auth-logo-text">Kodbank</span>
        </div>
        <p className="auth-sidebar-tagline">Secure banking, simplified.</p>
        <nav className="auth-sidebar-nav">
          <Link to="/login" className="auth-nav-link">Sign in</Link>
        </nav>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Open your account in a few steps. Your customer ID will be assigned automatically.</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="Choose a username"
                autoComplete="username"
              />
              {errors.username && <span className="form-error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
                className={errors.phone ? 'error' : ''}
                placeholder="Digits only"
                autoComplete="tel"
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            {errors.submit && <div className="form-error submit-error">{errors.submit}</div>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
