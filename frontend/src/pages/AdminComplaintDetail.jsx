import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API } from '../context/AuthContext';
import { AdminSidebar } from './AdminDashboard';

const statusLabels = { submitted: 'Submitted', under_review: 'Under Review', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected' };
const statuses = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected'];
const priorities = ['low', 'normal', 'high', 'urgent'];
function formatDate(dt) { return dt ? new Date(dt).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' }) : '—'; }

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [form, setForm] = useState({ status: '', priority: '', message: '', resolution: '', is_public: true });

  const load = () => {
    setLoading(true);
    API.get(`/complaints/admin/${id}`)
      .then(r => {
        setData(r.data);
        setForm(f => ({ ...f, status: r.data.complaint.status, priority: r.data.complaint.priority }));
      })
      .catch(() => toast.error('Failed to load complaint'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const update = async (e) => {
    e.preventDefault();
    if (!form.message) { toast.error('Please add an update message'); return; }
    setUpdating(true);
    try {
      await API.patch(`/complaints/admin/${id}/status`, form);
      toast.success('Complaint updated!');
      load();
      setForm(f => ({ ...f, message: '', resolution: '' }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="admin-layout"><AdminSidebar /><div className="admin-main" style={{ display: 'grid', placeItems: 'center' }}><div className="spinner" /></div></div>;
  if (!data) return null;

  const { complaint, updates } = data;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/admin/complaints')} className="btn btn-ghost btn-sm">← Back</button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.4rem' }}>{complaint.subject}</h1>
            <code style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>{complaint.tracking_number}</code>
          </div>
          <span className={`badge badge-${complaint.status}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            {statusLabels[complaint.status]}
          </span>
        </div>

        <div className="grid-2">
          {/* Left: complaint details */}
          <div>
            <div className="card mb-2">
              <div className="card-header"><h3>Complaint Details</h3></div>
              <div className="card-body">
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <tbody>
                    {[
                      ['Submitter', complaint.is_anonymous ? '🕵️ Anonymous' : complaint.submitter_name],
                      ['Email', complaint.submitter_email || '—'],
                      ['Phone', complaint.submitter_phone || '—'],
                      ['Category', complaint.category],
                      ['Department', complaint.department_name || '—'],
                      ['Location', complaint.location || '—'],
                      ['Priority', <span className={`badge badge-${complaint.priority}`}>{complaint.priority}</span>],
                      ['Submitted', formatDate(complaint.submitted_at)],
                      ['Last Updated', formatDate(complaint.updated_at)],
                      ['Resolved', formatDate(complaint.resolved_at)],
                    ].map(([k, v]) => (
                      <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.6rem 0', color: 'var(--slate)', fontWeight: 600, width: '35%', paddingRight: '1rem' }}>{k}</td>
                        <td style={{ padding: '0.6rem 0' }}>{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="divider" />
                <p style={{ color: 'var(--ink-muted)', lineHeight: 1.7 }}>{complaint.description}</p>
                {complaint.resolution && (
                  <div className="alert alert-success mt-2">
                    <span>✅</span><div><strong>Resolution:</strong> {complaint.resolution}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <div className="card-header"><h3>Status History ({updates.length})</h3></div>
              <div className="card-body">
                <div className="tracking-timeline">
                  {updates.map(u => (
                    <div key={u.id} className="timeline-item">
                      <div className={`timeline-dot ${['resolved', 'closed'].includes(u.new_status) ? 'done' : ''}`} />
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${u.new_status}`}>{statusLabels[u.new_status]}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--slate)' }}>{!u.is_public && '🔒 Internal'}</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginTop: '0.3rem' }}>{u.message}</p>
                        <div className="timeline-time">
                          {u.updated_by_name && <span style={{ marginRight: '1rem' }}>By: {u.updated_by_name}</span>}
                          {formatDate(u.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: update form */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '90px' }}>
              <div className="card-header" style={{ background: 'var(--accent)', color: 'white' }}>
                <h3>Update Complaint</h3>
              </div>
              <div className="card-body">
                <form onSubmit={update}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">New Status <span>*</span></label>
                      <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                        {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Priority</label>
                      <select className="form-control" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                        {priorities.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Update Message <span>*</span></label>
                    <textarea className="form-control" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Describe what action was taken or the current status..." required style={{ minHeight: 100 }} />
                  </div>

                  {['resolved', 'closed'].includes(form.status) && (
                    <div className="form-group">
                      <label className="form-label">Resolution Summary</label>
                      <textarea className="form-control" value={form.resolution} onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))}
                        placeholder="Summarize how the complaint was resolved..." style={{ minHeight: 80 }} />
                    </div>
                  )}

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="is_public" checked={form.is_public}
                      onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))}
                      style={{ width: 16, height: 16 }} />
                    <label htmlFor="is_public" style={{ margin: 0, cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}>
                      Visible to citizen (uncheck for internal note)
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={updating}>
                    {updating ? 'Updating...' : '📤 Save Update'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
