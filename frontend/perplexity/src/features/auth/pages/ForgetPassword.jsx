import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/auth.api';

function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await forgotPassword({ email });
      setMessage('Password reset email sent! Check your inbox.');
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setMessage(err.message || 'Failed to send reset email');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h2>Forgot Password?</h2>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {message && (
            <div className={`auth-alert ${isSuccess ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-links">
          <p><Link to="/">Back to Login</Link></p>
          <p><Link to="/register">Create new account</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
