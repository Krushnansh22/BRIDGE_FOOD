import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDonor = user?.role === 'donor';
  const isNgo = user?.role === 'ngo';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span>🌱</span> FoodBridge
        </Link>

        <div className="navbar-actions">
          {user && (
            <>
              <span className={`nav-role-badge ${isNgo ? 'ngo' : ''}`}>
                {isDonor ? '🏪 Donor' : '🤝 NGO'}
              </span>

              {isDonor && (
                <>
                  <NavLink to="/donor" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Listings
                  </NavLink>
                </>
              )}

              {isNgo && (
                <>
                  <NavLink to="/ngo/feed" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    Browse
                  </NavLink>
                  <NavLink to="/ngo/requests" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    My Requests
                  </NavLink>
                </>
              )}

              <NavLink to="/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                🔔
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Profile
              </NavLink>
              <button className="nav-btn ghost" onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}

          {!user && (
            <>
              <Link to="/login" className="nav-link">Sign in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
