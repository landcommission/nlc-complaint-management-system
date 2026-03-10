import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { AdminSidebar } from './AdminDashboard';

const statusLabels = { submitted: 'Submitted', under_review: 'Under Review', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed', rejected: 'Rejected' };
const statuses = ['', 'submitted', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected'];
const priorities = ['', 'low', 'normal', 'high', 'urgent'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [departments, setDepartments] = useState([]);
  const [deptFilter, setDeptFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/departments').then(r => setDepartments(r.data.departments)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 25, ...filters, department_id: deptFilter });
    API.get(`/complaints/admin/all?${params}`)
      .then(r => { setComplaints(r.data.complaints); setTotal(r.data.total); setPages(r.data.pages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filters, deptFilter]);

  useEffect(() => { load(); }, [load]);

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>All Complaints</h1>
            <p>{total} total complaints</p>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by subject, tracking # or name..."
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
          />
          <select className="form-control" style={{ width: 'auto' }} value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.filter(Boolean).map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={filters.priority} onChange={e => handleFilter('priority', e.target.value)}>
            <option value="">All Priorities</option>
            {priorities.filter(Boolean).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div className="card">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : complaints.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No complaints found</h3><p>Try adjusting your filters.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Subject</th>
                    <th>Submitter</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c.id} onClick={() => navigate(`/admin/complaints/${c.id}`)}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {c.is_anonymous && <span title="Anonymous">🕵️</span>}
                          <code style={{ fontSize: '0.78rem' }}>{c.tracking_number}</code>
                        </div>
                      </td>
                      <td style={{ maxWidth: 240 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{c.subject}</div></td>
                      <td>{c.is_anonymous ? <span className="text-muted">Anonymous</span> : c.submitter_name}</td>
                      <td>{c.department_name || <span className="text-muted">—</span>}</td>
                      <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                      <td><span className={`badge badge-${c.status}`}>{statusLabels[c.status]}</span></td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem', color: 'var(--slate)' }}>{new Date(c.submitted_at).toLocaleDateString()}</td>
                      <td>
                        <Link to={`/admin/complaints/${c.id}`} className="btn btn-ghost btn-sm" onClick={e => e.stopPropagation()}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: 'var(--slate)' }}>Page {page} of {pages}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
