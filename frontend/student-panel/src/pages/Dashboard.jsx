import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getGrade, getGradeColor } from '../utils/gradeUtils';

const API = 'http://localhost:5000/api';

const Dashboard = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [marks, setMarks] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selSem, setSelSem] = useState('all');
    const [loading, setLoading] = useState(true);
    const [rank, setRank] = useState(null);

    useEffect(() => {
        const h = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API}/student/profile`, { headers: h }).then(r => r.json()),
            fetch(`${API}/student/marks`, { headers: h }).then(r => r.json()),
            fetch(`${API}/student/semesters`, { headers: h }).then(r => r.json()),
            fetch(`${API}/student/rank`, { headers: h }).then(r => r.json()).catch(() => null),
        ]).then(([p, m, s, r]) => {
            setProfile(p && !p.error ? p : null);
            setMarks(Array.isArray(m) ? m : []);
            setSemesters(Array.isArray(s) ? s : []);
            setRank(r && r.rank ? r : null);
        }).finally(() => setLoading(false));
    }, [token]);

    const semNums = [...new Set(marks.map(m => m.semester_number))].sort();
    const filtered = selSem === 'all' ? marks : marks.filter(m => String(m.semester_number) === selSem);
    const avg = filtered.length ? (filtered.reduce((a, m) => a + m.marks, 0) / filtered.length).toFixed(1) : '—';
    const passed = filtered.filter(m => m.marks >= 50).length;

    const COLORS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

    return (
        <Layout title="My Dashboard">
            {loading ? <div className="loading">Loading your data...</div> : (
                <>
                    {/* Profile */}
                    {profile && (
                        <div className="card" style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                                <div>
                                    <h2 style={{ marginBottom: '0.2rem' }}>{profile.student_name}</h2>
                                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{profile.email}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{profile.department_name}</span>
                                    <span className="badge badge-warning">Semester {profile.current_semester}</span>
                                    {rank && rank.rank && (
                                        <span className="badge badge-success">🏆 Dept Rank #{rank.rank} of {rank.total_students}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="stat-grid">
                        <div className="stat-card"><div className="label">Subjects Recorded</div><div className="value" style={{ color: '#22c55e' }}>{filtered.length}</div></div>
                        <div className="stat-card"><div className="label">Average Marks</div><div className="value" style={{ color: '#818cf8' }}>{avg}</div></div>
                        <div className="stat-card"><div className="label">Subjects Passed</div><div className="value" style={{ color: '#f59e0b' }}>{passed}</div></div>
                        {rank && rank.rank && (
                            <div className="stat-card">
                                <div className="label">Dept Rank</div>
                                <div className="value" style={{ color: '#f59e0b' }}>#{rank.rank}<span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400 }}> / {rank.total_students}</span></div>
                            </div>
                        )}
                    </div>

                    {/* Semester tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <button className={`btn ${selSem === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelSem('all')}>All Semesters</button>
                        {semNums.map(s => (
                            <button key={s} className={`btn ${selSem === String(s) ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelSem(String(s))}>
                                Sem {s}
                            </button>
                        ))}
                    </div>

                    {/* Chart */}
                    {filtered.length > 0 && (
                        <div className="card" style={{ marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Marks Overview</div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={filtered} margin={{ top: 0, right: 10, left: -20, bottom: 55 }}>
                                    <XAxis dataKey="subject_code" tick={{ fontSize: 10, fill: '#64748b' }} angle={-35} textAnchor="end" />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
                                    <Bar dataKey="marks" radius={[4, 4, 0, 0]}>
                                        {filtered.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Marks table */}
                    <div className="card">
                        <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Subject Marks</div>
                        {filtered.length === 0 ? (
                            <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>No marks recorded yet.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr><th>Subject</th><th>Code</th><th>Sem</th><th>Marks</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(m => (
                                            <tr key={m.id}>
                                                <td style={{ fontWeight: 500 }}>{m.subject_name}</td>
                                                <td style={{ color: 'var(--muted)' }}>{m.subject_code}</td>
                                                <td>Sem {m.semester_number}</td>
                                                <td><strong>{m.marks}</strong>/100</td>
                                                <td>
                                                    <span className={`badge ${getGradeColor(m.marks)}`} style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                                                        {getGrade(m.marks)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </Layout>
    );
};

export default Dashboard;
