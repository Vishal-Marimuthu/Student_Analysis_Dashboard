import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';

const API = 'http://localhost:5000/api';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Login failed.'); return; }
            if (data.user.role !== 'admin') { setError('Access denied. Admin accounts only.'); return; }
            login(data.user, data.token);
            navigate('/');
        } catch {
            setError('Cannot connect to server. Make sure the backend is running.');
        } finally { setLoading(false); }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div className="logo-icon" style={{ width: 40, height: 40, borderRadius: 10, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.3rem', margin: 0 }}>Admin Portal</h1>
                        <p style={{ margin: 0 }}>University Dashboard</p>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" placeholder="admin@university.edu" value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" placeholder="••••••••" value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--muted)', fontSize: '0.8rem' }}>
                    Default: admin@university.edu / admin123
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
