import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, ClipboardList, Trophy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    const nav = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/students', icon: Users, label: 'All Students' },
        { to: '/add-student', icon: PlusCircle, label: 'Add Student' },
        { to: '/add-marks', icon: ClipboardList, label: 'Add Marks' },
        { to: '/rankings', icon: Trophy, label: 'Rankings' },
    ];

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">A</div>
                    <span>AcadAdmin</span>
                </div>
                <nav>
                    {nav.map(({ to, icon: Icon, label }) => (
                        <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Icon size={18} /> {label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-item" onClick={handleLogout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            <div className="main-area">
                <header className="topbar">
                    <h1>{title}</h1>
                    <div className="user-info">
                        <span>{user?.name}</span>
                        <span className="user-badge">Admin</span>
                    </div>
                </header>
                <main className="page-content">{children}</main>
            </div>
        </div>
    );
};

export default Layout;
