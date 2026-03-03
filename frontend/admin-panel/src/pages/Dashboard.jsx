import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Users, GraduationCap, BookOpen } from 'lucide-react';

const API = 'http://localhost:5000/api';

const Dashboard = () => {
    const { token } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API}/admin/students`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : [])).catch(console.error).finally(() => setLoading(false));
    }, [token]);

    // Group by department
    const deptCounts = students.reduce((acc, s) => {
        acc[s.department_name] = (acc[s.department_name] || 0) + 1;
        return acc;
    }, {});

    return (
        <Layout title="Dashboard">
            <div className="stat-grid">
                <div className="stat-card">
                    <div className="label">Total Students</div>
                    <div className="value" style={{ color: '#818cf8' }}>{students.length}</div>
                </div>
                <div className="stat-card">
                    <div className="label">Departments</div>
                    <div className="value" style={{ color: '#22c55e' }}>{Object.keys(deptCounts).length}</div>
                </div>
                <div className="stat-card">
                    <div className="label">Active Semesters</div>
                    <div className="value" style={{ color: '#f59e0b' }}>8</div>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                    <Users size={18} /> Students by Department
                </div>
                {loading ? <div className="loading">Loading...</div> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {Object.entries(deptCounts).map(([dept, count]) => (
                            <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg3)', borderRadius: 8 }}>
                                <span style={{ fontSize: '0.88rem' }}>{dept}</span>
                                <span className="badge badge-primary">{count} students</span>
                            </div>
                        ))}
                        {Object.keys(deptCounts).length === 0 && (
                            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '1rem' }}>No students added yet.</p>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
