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

  const [files, setFiles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    API.get('/departments')
      .then((r) => setDepartments(r.data.departments || []))
      .catch(() => {});
  }, []);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.category || !form.subject || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const data = new FormData();
    data.append('name', form.name);
    data.append('email', form.email);
    data.append('phone', form.phone);
    data.append('category', form.category);
    data.append('department_id', form.department_id);
    data.append('subject', form.subject);
    data.append('description', form.description);
    data.append('location', form.location);

    files.forEach((file) => {
      data.append('attachments', file);
    });

    setLoading(true);

    try {
      const res = await API.post('/complaints/anonymous', data);

      setSubmitted(res.data.tracking_number);
      toast.success('Anonymous complaint submitted!');
      setForm({
        name: '',
        email: '',
        phone: '',
        category: '',
        department_id: '',
        subject: '',
        description: '',
        location: ''
      });
      setFiles([]);
    } catch (err) {
      console.error(err);
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
            <h2 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: '0.5rem' }}>
              Anonymous Complaint Received!
            </h2>
            <p className="text-muted">
              Your complaint has been submitted anonymously. Save your tracking number — this is the only way to check its status:
            </p>
            <span className="tracking-number-display">{submitted}</span>

            <div className="alert alert-warning mt-2" style={{ textAlign: 'left' }}>
              <span>⚠️</span>
              <span>
                <strong>Important:</strong> Copy this tracking number now. It won't be shown again if you didn't provide an email.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(submitted);
                toast.success('Copied!');
              }}
              className="btn btn-primary btn-lg"
            >
              📋 Copy Tracking Number
            </button>

            <button
              type="button"
              onClick={() => setSubmitted(null)}
              className="btn btn-outline btn-lg"
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
          <p>Submit a complaint without creating an account. Your identity is not required.</p>
        </div>

        <div className="alert alert-info mb-3">
          <span>🔒</span>
          <div>
            <strong>Your privacy is protected.</strong> Contact details below are optional and only used if you want updates. You can leave them blank to remain completely anonymous.
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Anonymous Submission</h2>
          </div>

          <div className="card-body">
            <form onSubmit={submit}>
              <p
                style={{
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  fontSize: '0.875rem',
                  color: 'var(--slate)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Optional Contact Details
              </p>

              <div className="form-row" style={{ marginBottom: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Name (optional)</label>
                  <input
                    name="name"
                    type="text"
                    className="form-control"
                    value={form.name}
                    onChange={handle}
                    placeholder="Leave blank to be fully anonymous"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email (optional)</label>
                  <input
                    name="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={handle}
                    placeholder="For status updates only"
                  />
                </div>
              </div>

              <div className="divider" />

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Category <span>*</span>
                  </label>
                  <select
                    name="category"
                    className="form-control"
                    value={form.category}
                    onChange={handle}
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    name="department_id"
                    className="form-control"
                    value={form.department_id}
                    onChange={handle}
                  >
                    <option value="">Select department (optional)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Area</label>
                <input
                  name="location"
                  type="text"
                  className="form-control"
                  value={form.location}
                  onChange={handle}
                  placeholder="e.g. Nyeri Town, Karatina"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Subject <span>*</span>
                </label>
                <input
                  name="subject"
                  type="text"
                  className="form-control"
                  value={form.subject}
                  onChange={handle}
                  placeholder="Brief description of your complaint"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description <span>*</span>
                </label>
                <textarea
                  name="description"
                  className="form-control"
                  value={form.description}
                  onChange={handle}
                  placeholder="Describe your complaint in detail..."
                  required
                  style={{ minHeight: 150 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Attach Documents</label>
                <input
                  type="file"
                  className="form-control"
                  multiple
                  onChange={handleFiles}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="form-hint">
                  You can attach supporting documents or images.
                </div>

                {files.length > 0 && (
                  <div className="mt-2 text-muted">{files.length} file(s) selected</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Submitting...' : '🕵️ Submit Anonymously'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}