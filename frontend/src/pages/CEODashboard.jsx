import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { API } from '../context/AuthContext';

const statusLabels = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  rejected: 'Rejected'
};

const PIE_COLORS = ['#1a6ef8', '#10b981', '#f59e0b', '#ef4444', '#7c3aed', '#0ea5e9', '#ec4899', '#14b8a6'];

function CEOSidebar() {
  return (
    <div className="admin-sidebar">
      <div style={{ padding: '0 1.5rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate)', fontWeight: 600 }}>
          CEO Panel
        </div>
      </div>
      <NavLink to="/ceo-dashboard" end className="admin-sidebar-link">📊 Dashboard</NavLink>
      <NavLink to="/track" className="admin-sidebar-link">🔎 Track Complaint</NavLink>
      <NavLink to="/" className="admin-sidebar-link">🏠 Public Site</NavLink>
    </div>
  );
}

export default function CEODashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  API.get('/complaints/admin/stats/overview')
    .then((r) => setStats(r.data))
    .catch((err) => {
      console.error('CEO dashboard error:', err.response?.data || err.message);
    })
    .finally(() => setLoading(false));
}, []);

  const statCards = stats ? [
    { label: 'Total Complaints', value: stats.total, icon: '📋', color: '#eef4ff', iconColor: '#1a6ef8' },
    { label: 'Pending Review', value: stats.submitted, icon: '📥', color: '#fff7ed', iconColor: '#f59e0b' },
    { label: 'In Progress', value: stats.inProgress, icon: '⚙️', color: '#eff6ff', iconColor: '#3b82f6' },
    { label: 'Resolved', value: stats.resolved, icon: '✅', color: '#ecfdf5', iconColor: '#10b981' },
    { label: 'Anonymous', value: stats.anonymous, icon: '🕵️', color: '#f5f3ff', iconColor: '#7c3aed' },
    { label: 'Urgent Unresolved', value: stats.urgent, icon: '🚨', color: '#fef2f2', iconColor: '#ef4444' },
  ] : [];

  return (
    <div className="admin-layout">
      <CEOSidebar />
      <div className="admin-main">
        <div className="page-header">
          <h1>CEO'S Dashboard</h1>
          <p>Executive overview of complaints, trends, and departmental performance</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : stats && (
          <>
            <div className="stats-grid">
              {statCards.map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-icon" style={{ background: s.color, color: s.iconColor }}>{s.icon}</div>
                  <div>
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid-2 mb-2">
              <div className="card">
                <div className="card-header"><h3>Monthly Submissions</h3></div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.byMonth}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1a6ef8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3>Top Departments</h3></div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.byDept}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.byDept.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Recent Complaints</h3>
                <Link to="/track" className="btn btn-ghost btn-sm">Track</Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Tracking #</th>
                      <th>Subject</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map((c) => (
                      <tr key={c.tracking_number}>
                        <td><code style={{ fontSize: '0.78rem' }}>{c.tracking_number}</code></td>
                        <td style={{ maxWidth: 220 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.subject}
                          </div>
                        </td>
                        <td>{c.department_name || '—'}</td>
                        <td><span className={`badge badge-${c.status}`}>{statusLabels[c.status]}</span></td>
                        <td><span className={`badge badge-${c.priority}`}>{c.priority}</span></td>
                        <td>{new Date(c.submitted_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}