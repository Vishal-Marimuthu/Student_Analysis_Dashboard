import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon" style={{ color: '#000' }}>S</div>
                    <span>Student Portal</span>
                </div>
                <nav>
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={18} /> My Dashboard
                    </NavLink>
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-item" onClick={() => { logout(); navigate('/login'); }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>
            <div className="main-area">
                <header className="topbar">
                    <h1>{title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted)', fontSize: '0.85rem' }}>
                        <span>{user?.name}</span>
                        <span className="user-badge">Student</span>
                    </div>
                </header>
                <main className="page-content">{children}</main>
            </div>
        </div>
    );
};

export default Layout;
