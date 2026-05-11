import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/auth.api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (!urlToken) {
      setMessage('Invalid reset link. No token found.');
      return;
    }
    setToken(urlToken);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsSuccess(false);
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await resetPassword({ token, password });
      setMessage('Password reset successful! Redirecting to login…');
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage(err.message || 'Reset failed');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>Invalid Reset Link</h2>
          <div className="auth-links">
            <p><Link to="/">Back to Login</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Enter your new password below.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`auth-alert ${isSuccess ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-links">
          <p><Link to="/">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
