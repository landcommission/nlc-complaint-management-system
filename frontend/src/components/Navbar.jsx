import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../context/nlc-logo (1).png';

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
          <img src={logo} alt="NLCCMS Logo" className="brand-logo" />
          <div>
            <div className="brand-text">NLCCMS</div>
            <div className="brand-sub">Complaint Management</div>
          </div>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end className="nav-link">Home</NavLink>
          <NavLink to="/track" className="nav-link">Track Complaint</NavLink>
          <NavLink to="/anonymous" className="nav-link">Anonymous</NavLink>
          {user && <NavLink to="/my-complaints" className="nav-link">My Complaints</NavLink>}
          {user && ['admin', 'staff'].includes(user.role) && (
            <NavLink to="/admin" className="nav-link">Admin Panel</NavLink>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <div className="user-chip">
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                {user.name.split(' ')[0]}
              </div>
              {!['admin', 'staff'].includes(user.role) && (
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
