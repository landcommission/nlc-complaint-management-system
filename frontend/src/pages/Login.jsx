import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
  if (user.role === 'admin' || user.role === 'staff') {
    navigate('/admin');
  } else if (user.role === 'ceo') {
    navigate('/ceo-dashboard');
  } else {
    navigate('/my-complaints');
  }
  return null;
}

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      if (data.user.role === 'admin' || data.user.role === 'staff') {
  navigate('/admin');
} else if (data.user.role === 'ceo') {
  navigate('/ceo-dashboard');
} else {
  navigate('/my-complaints');
}
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', paddingTop: '3rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="text-center mb-3">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome back</h1>
          <p className="text-muted">Sign in to your CMS account</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Email Address <span>*</span></label>
                <input name="email" type="email" className="form-control" value={form.email} onChange={handle} placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span>*</span></label>
                <input name="password" type="password" className="form-control" value={form.password} onChange={handle} placeholder="Your password" required />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="divider" />

            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              <span>💡</span>
              <span>Admin demo: <strong>ken.kimathi@landcommission.go.ke</strong> / <strong>Admin@2026</strong></span>
            </div>
          </div>
        </div>

        <p className="text-center mt-2 text-muted" style={{ fontSize: '0.875rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register here</Link>
        </p>
        <p className="text-center mt-1 text-muted" style={{ fontSize: '0.875rem' }}>
          Want to report anonymously? <Link to="/anonymous" style={{ color: 'var(--accent)', fontWeight: 600 }}>Submit anonymously</Link>
        </p>
      </div>
    </div>
  );
}
