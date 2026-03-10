import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';

const categories = [
  'Infrastructure',
  'Water & Sanitation',
  'Public Health',
  'Education',
  'Security',
  'Environment',
  'Finance',
  'Social Services',
  'Roads',
  'Other'
];

export default function AnonymousComplaint() {

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    department_id: '',
    subject: '',
    description: '',
    location: ''
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    API.get('/api/departments')
      .then(res => setDepartments(res.data.departments))
      .catch(() => {});
  }, []);

  const handle = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.category || !form.subject || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {

      const data = new FormData();

      data.append('name', form.name || '');
      data.append('email', form.email || '');
      data.append('phone', form.phone || '');
      data.append('category', form.category);
      data.append('department_id', form.department_id || '');
      data.append('subject', form.subject);
      data.append('description', form.description);
      data.append('location', form.location || '');

      if (files.length > 0) {
        files.forEach(file => data.append('attachments', file));
      }

      const res = await API.post('/complaints/anonymous', data);

      setSubmitted(res.data.tracking_number);
      toast.success('Anonymous complaint submitted!');

    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="container-sm">

          <div className="tracking-success">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🕵️</div>

            <h2 style={{ fontWeight: 800 }}>
              Anonymous Complaint Received!
            </h2>

            <p className="text-muted">
              Save your tracking number to check complaint status.
            </p>

            <span className="tracking-number-display">{submitted}</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>

            <button
              onClick={() => {
                navigator.clipboard.writeText(submitted);
                toast.success('Copied!');
              }}
              className="btn btn-primary"
            >
              Copy Tracking Number
            </button>

            <button
              onClick={() => setSubmitted(null)}
              className="btn btn-outline"
            >
              Submit Another
            </button>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container-md">

        <div className="page-header">
          <h1>🕵️ Anonymous Complaint</h1>
          <p>Submit a complaint without creating an account.</p>
        </div>

        <div className="card">

          <div className="card-header">
            <h2>Anonymous Submission</h2>
          </div>

          <div className="card-body">

            <form onSubmit={submit}>

              <div className="form-row">

                <div className="form-group">
                  <label>Name (optional)</label>
                  <input
                    name="name"
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={handle}
                  />
                </div>

                <div className="form-group">
                  <label>Email (optional)</label>
                  <input
                    name="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={handle}
                  />
                </div>

              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  name="category"
                  className="form-control"
                  value={form.category}
                  onChange={handle}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  name="subject"
                  className="form-control"
                  value={form.subject}
                  onChange={handle}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={form.description}
                  onChange={handle}
                  required
                />
              </div>

              <div className="form-group">
                <label>Attach Evidence (optional)</label>
                <input
                  type="file"
                  multiple
                  className="form-control"
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Anonymously'}
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}