import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';

const statusColors = { submitted: 'submitted', under_review: 'under_review', in_progress: 'in_progress', resolved: 'resolved', closed: 'closed', rejected: 'rejected' };
const statusLabels = { submitted: 'Submitted', under_review: 'Under Review', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected' };

function formatDate(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function TrackComplaint() {
  const [params] = useSearchParams();
  const [ref, setRef] = useState(params.get('ref') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.get('ref')) track(params.get('ref'));
  }, []);

  const track = async (trackingNum = ref) => {
    if (!trackingNum.trim()) { toast.error('Enter a tracking number'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await API.get(`/complaints/track/${trackingNum.trim().toUpperCase()}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Complaint not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page"><div className="container-md">
      <div className="page-header">
        <h1>🔍 Track Your Complaint</h1>
        <p>Enter your tracking number to check the status of your complaint.</p>
      </div>

      <div className="tracking-box">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Tracking Number</label>
            <input
              type="text"
              className="form-control"
              value={ref}
              onChange={e => setRef(e.target.value)}
              placeholder="e.g. CMS-2026-ABCDEF"
              onKeyDown={e => e.key === 'Enter' && track()}
              style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em', fontSize: '1rem' }}
            />
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => track()} disabled={loading}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <span>❌</span> {error}
        </div>
      )}

      {result && (
        <div>
          {/* Complaint Header */}
          <div className="card mb-2">
            <div className="card-header">
              <div>
                <h2 style={{ fontSize: '1.1rem' }}>{result.complaint.subject}</h2>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--slate)' }}>{result.complaint.tracking_number}</span>
              </div>
              <span className={`badge badge-${statusColors[result.complaint.status]}`}>
                {statusLabels[result.complaint.status]}
              </span>
            </div>
            <div className="card-body">
              <div className="complaint-meta">
                <span className="meta-item">📂 {result.complaint.category}</span>
                {result.complaint.department_name && <span className="meta-item">🏛️ {result.complaint.department_name}</span>}
                {result.complaint.location && <span className="meta-item">📍 {result.complaint.location}</span>}
                <span className="meta-item">📅 {formatDate(result.complaint.submitted_at)}</span>
                <span className={`badge badge-${result.complaint.priority}`} style={{ fontSize: '0.72rem' }}>
                  {result.complaint.priority?.toUpperCase()} priority
                </span>
              </div>
              <p style={{ color: 'var(--ink-muted)', marginTop: '0.75rem', lineHeight: 1.7 }}>{result.complaint.description}</p>
              {result.complaint.resolution && (
                <div className="alert alert-success mt-2">
                  <span>✅</span>
                  <div><strong>Resolution:</strong> {result.complaint.resolution}</div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <div className="card-header"><h3>Status History</h3></div>
            <div className="card-body">
              {result.updates.length === 0 ? (
                <p className="text-muted">No updates yet.</p>
              ) : (
                <div className="tracking-timeline">
                  {result.updates.map((u, i) => (
                    <div key={u.id} className="timeline-item">
                      <div className={`timeline-dot ${['resolved', 'closed'].includes(u.new_status) ? 'done' : ''}`} />
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div>
                            <span className={`badge badge-${statusColors[u.new_status]}`} style={{ marginBottom: '0.35rem' }}>
                              {statusLabels[u.new_status] || u.new_status}
                            </span>
                            <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginTop: '0.3rem' }}>{u.message}</p>
                          </div>
                        </div>
                        <div className="timeline-time">
                          {u.updated_by_name && <span style={{ marginRight: '1rem' }}>By: {u.updated_by_name}</span>}
                          {formatDate(u.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div></div>
  );
}
