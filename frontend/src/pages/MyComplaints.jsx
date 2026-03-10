import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';

const statusLabels = { submitted: 'Submitted', under_review: 'Under Review', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected' };
function formatDate(dt) { return dt ? new Date(dt).toLocaleDateString('en-KE', { dateStyle: 'medium' }) : '—'; }

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/complaints/my')
      .then(r => setComplaints(r.data.complaints))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page"><div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Complaints</h1>
          <p>All complaints submitted under your account</p>
        </div>
        <Link to="/submit" className="btn btn-primary">+ New Complaint</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : complaints.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No Complaints Yet</h3>
          <p>You haven't submitted any complaints. Click the button above to get started.</p>
          <Link to="/submit" className="btn btn-primary mt-2">Submit Your First Complaint</Link>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2>All Complaints ({complaints.length})</h2>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tracking #</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} onClick={() => navigate(`/track?ref=${c.tracking_number}`)}>
                    <td><code style={{ fontSize: '0.8rem', background: 'var(--surface)', padding: '2px 6px', borderRadius: 4 }}>{c.tracking_number}</code></td>
                    <td style={{ maxWidth: 250 }}>
                      <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.subject}</div>
                    </td>
                    <td>{c.category}</td>
                    <td>{c.department_name || <span className="text-muted">—</span>}</td>
                    <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                    <td><span className={`badge badge-${c.status}`}>{statusLabels[c.status]}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(c.submitted_at)}</td>
                    <td>
                      <Link to={`/track?ref=${c.tracking_number}`} className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div></div>
  );
}
