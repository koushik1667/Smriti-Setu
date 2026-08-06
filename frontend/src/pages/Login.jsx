import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Pill, AlertCircle } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { ThemeToggle } from '../components/ThemeToggle';

export const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ position: 'relative' }}>
        {/* Theme Toggle Button */}
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <ThemeToggle compact />
        </div>

        {/* Brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--r-full)', background: 'var(--md-sys-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-elevation-1)' }}>
            <Pill size={20} color="var(--md-sys-color-on-primary)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)' }}>PharmaVision AI</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--md-sys-color-on-surface-variant)' }}>Medicine Scanner</div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface)', marginBottom: '6px' }}>Sign in</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '28px' }}>Welcome back — enter your credentials to continue.</p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--md-sys-color-error-container)', borderRadius: 'var(--r-full)', color: 'var(--md-sys-color-on-error-container)', fontSize: '0.85rem', marginBottom: '20px', fontWeight: 500 }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <GoogleSignInButton text="Sign in with Google" onError={(err) => setError(err)} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '6px' }}>Email Address</label>
            <input type="email" required className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '6px' }}>Password</label>
            <input type="password" required className="input-field" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '24px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--md-sys-color-primary)', textDecoration: 'none', fontWeight: 700 }}>Register</Link>
        </p>
      </div>
    </div>
  );
};
