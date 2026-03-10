import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';

const categories = ['Infrastructure', 'Water & Sanitation', 'Public Health', 'Education', 'Security', 'Environment', 'Finance', 'Social Services', 'Roads', 'Other'];

export default function SubmitComplaint() {
  const [form, setForm] = useState({ category: '', department_id: '', subject: '', description: '', location: '', priority: 'normal' });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/departments').then(r => setDepartments(r.data.departments)).catch(() => {});
  }, []);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.subject || !form.description) { toast.error('Please fill in all required fields'); return; }
    setLoading(true);
    try {
      const res = await API.post('/complaints', form);
      setSubmitted(res.data.tracking_number);
      toast.success('Complaint submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page"><div className="container-sm">
        <div className="tracking-success">
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: '0.5rem' }}>Complaint Submitted!</h2>
          <p className="text-muted">Your complaint has been received. Save your tracking number:</p>
          <span className="tracking-number-display">{submitted}</span>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>You can track your complaint status using this number at any time.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(`/track?ref=${submitted}`)} className="btn btn-primary btn-lg">Track This Complaint</button>
          <button onClick={() => { setSubmitted(null); setForm({ category: '', department_id: '', subject: '', description: '', location: '', priority: 'normal' }); }} className="btn btn-outline btn-lg">Submit Another</button>
          <button onClick={() => navigate('/my-complaints')} className="btn btn-ghost btn-lg">My Complaints</button>
        </div>
      </div></div>
    );
  }

  return (
    <div className="page"><div className="container-md">
      <div className="page-header">
        <h1>Submit a Complaint</h1>
        <p>Fill in the details below. All fields marked with * are required.</p>
      </div>

      <div className="card">
        <div className="card-header"><h2>Complaint Details</h2></div>
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category <span>*</span></label>
                <select name="category" className="form-control" value={form.category} onChange={handle} required>
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department_id" className="form-control" value={form.department_id} onChange={handle}>
                  <option value="">Select department (optional)</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" className="form-control" value={form.priority} onChange={handle}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location / Area</label>
                <input name="location" type="text" className="form-control" value={form.location} onChange={handle} placeholder="e.g. Nyeri Town, Karatina" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Subject <span>*</span></label>
              <input name="subject" type="text" className="form-control" value={form.subject} onChange={handle} placeholder="Brief title describing your complaint" required maxLength={200} />
            </div>

            <div className="form-group">
              <label className="form-label">Description <span>*</span></label>
              <textarea name="description" className="form-control" value={form.description} onChange={handle}
                placeholder="Describe your complaint in detail. Include dates, times, people involved, and any other relevant information..."
                required style={{ minHeight: 150 }} />
              <div className="form-hint">Be as specific as possible to help us resolve your issue faster.</div>
            </div>

            <div className="alert alert-info">
              <span>ℹ️</span>
              <span>Your name and contact information from your account will be associated with this complaint for follow-up purposes.</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Submitting...' : '📤 Submit Complaint'}
              </button>
              <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost btn-lg">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div></div>
  );
}
