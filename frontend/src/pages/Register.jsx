import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) { navigate('/'); return null; }

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.phone);
      toast.success(`Account created! Welcome, ${data.user.name.split(' ')[0]}!`);
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'grid', placeItems: 'center', paddingTop: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="text-center mb-3">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👤</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create an Account</h1>
          <p className="text-muted">Register to submit and track complaints</p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={submit}>
              <div className="form-group">
                <label className="form-label">Full Name <span>*</span></label>
                <input name="name" type="text" className="form-control" value={form.name} onChange={handle} placeholder="John Mwangi" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address <span>*</span></label>
                  <input name="email" type="email" className="form-control" value={form.email} onChange={handle} placeholder="you@example.com" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input name="phone" type="tel" className="form-control" value={form.phone} onChange={handle} placeholder="+254-700-000-000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password <span>*</span></label>
                  <input name="password" type="password" className="form-control" value={form.password} onChange={handle} placeholder="Min. 6 characters" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password <span>*</span></label>
                  <input name="confirm" type="password" className="form-control" value={form.confirm} onChange={handle} placeholder="Repeat password" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-2 text-muted" style={{ fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
