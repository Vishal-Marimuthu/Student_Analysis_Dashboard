import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, ClipboardList, Trophy, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [init, setInit] = useState(!sessionStorage.getItem('sys_init_admin'));

    useEffect(() => {
        if (init) {
            const timer = setTimeout(() => {
                sessionStorage.setItem('sys_init_admin', 'true');
                setInit(false);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [init]);

    const handleLogout = () => {
        sessionStorage.removeItem('sys_init_admin');
        logout();
        navigate('/login');
    };

    const adminNav = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/students', icon: Users, label: 'All Students' },
        { to: '/add-student', icon: PlusCircle, label: 'Add Student' },
        { to: '/add-marks', icon: ClipboardList, label: 'Add Marks' },
        { to: '/rankings', icon: Trophy, label: 'Rankings' },
    ];
    
    const studentNav = [
        { to: '/student', icon: LayoutDashboard, label: 'My Dashboard' }
    ];
    
    const nav = user?.role === 'admin' ? adminNav : studentNav;

    return (
        <>
            {init && (
                <div className="system-init-overlay">
                    <div className="system-init-content">
                        <div className="system-spinner"></div>
                        <div className="system-text">System Initializing...</div>
                    </div>
                </div>
            )}
            <div className="app-layout">
                <aside className="sidebar">
                    <div className="sidebar-logo">
                        <div className="logo-icon">{user?.role === 'admin' ? 'A' : 'S'}</div>
                        <span>{user?.role === 'admin' ? 'AcadAdmin' : 'AcadStudent'}</span>
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
                            <span className="user-badge">{user?.role === 'admin' ? 'Admin' : 'Student'}</span>
                        </div>
                    </header>
                    <main className="page-content">{children}</main>
                </div>
            </div>
        </>
    );
};

export default Layout;
