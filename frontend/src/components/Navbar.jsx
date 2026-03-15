import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <img src="/nlc-logo.png" alt="NLC Logo" className="brand-logo" />
          </div>
          <div>
            <div className="brand-text">NLC CMS</div>
            <div className="brand-sub">Complaint Management System</div>
          </div>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end className="nav-link">Home</NavLink>
          <NavLink to="/track" className="nav-link">Track Complaint</NavLink>

          {!user && (
            <NavLink to="/anonymous" className="nav-link">Anonymous</NavLink>
          )}

          {user && user.role === 'citizen' && (
            <>
              <NavLink to="/anonymous" className="nav-link">Anonymous</NavLink>
              <NavLink to="/my-complaints" className="nav-link">My Complaints</NavLink>
            </>
          )}

          {user && ['admin', 'staff'].includes(user.role) && (
            <NavLink to="/admin" className="nav-link">Dashboard</NavLink>
          )}

          {user && user.role === 'ceo' && (
            <NavLink to="/ceo-dashboard" className="nav-link">Dashboard</NavLink>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              {user.role !== 'ceo' && (
                <div className="user-chip">
                  <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                  {user.name.split(' ')[0]}
                </div>
              )}

              {user.role === 'citizen' && (
                <Link to="/submit" className="btn btn-primary btn-sm">+ New Complaint</Link>
              )}

              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}