import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft } from 'lucide-react';

const API = 'http://localhost:5000/api';

const StudentDetailPage = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selSem, setSelSem] = useState('all');

    useEffect(() => {
        Promise.all([
            fetch(`${API}/admin/students/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
            fetch(`${API}/admin/students/${id}/marks`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        ]).then(([s, m]) => { setStudent(s); setMarks(m); }).finally(() => setLoading(false));
    }, [id, token]);

    const semesters = [...new Set(marks.map(m => m.semester_number))].sort();
    const filtered = selSem === 'all' ? marks : marks.filter(m => String(m.semester_number) === selSem);
    const avgScore = filtered.length ? (filtered.reduce((a, m) => a + m.marks, 0) / filtered.length).toFixed(1) : 0;

    const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

    return (
        <Layout title="Student Detail">
            {loading ? <div className="loading">Loading...</div> : !student ? (
                <p style={{ color: 'var(--muted)' }}>Student not found.</p>
            ) : (
                <>
                    <button className="btn btn-ghost" style={{ marginBottom: '1rem' }} onClick={() => navigate('/students')}>
                        <ArrowLeft size={16} /> Back to Students
                    </button>

                    {/* Profile card */}
                    <div className="card" style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '0.25rem' }}>{student.student_name}</h2>
                                <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{student.email}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className="badge badge-primary">{student.department_name}</span>
                                <span className="badge badge-warning">Sem {student.current_semester}</span>
                                <span className="badge badge-success">Avg: {avgScore}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Semester filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <button className={`btn ${selSem === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelSem('all')}>All</button>
                        {semesters.map(s => (
                            <button key={s} className={`btn ${selSem === String(s) ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelSem(String(s))}>
                                Sem {s}
                            </button>
                        ))}
                    </div>

                    {/* Chart */}
                    {filtered.length > 0 && (
                        <div className="card" style={{ marginBottom: '1rem' }}>
                            <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Marks Overview</div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={filtered} margin={{ top: 0, right: 10, left: -20, bottom: 60 }}>
                                    <XAxis dataKey="subject_code" tick={{ fontSize: 11, fill: '#64748b' }} angle={-35} textAnchor="end" />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
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
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>Subject</th><th>Code</th><th>Semester</th><th>Marks</th><th>Grade</th></tr>
                                </thead>
                                <tbody>
                                    {filtered.map(m => (
                                        <tr key={m.id}>
                                            <td style={{ fontWeight: 500 }}>{m.subject_name}</td>
                                            <td style={{ color: 'var(--muted)' }}>{m.subject_code}</td>
                                            <td>Sem {m.semester_number}</td>
                                            <td><strong>{m.marks}</strong>/100</td>
                                            <td>
                                                <span className={`badge ${m.marks >= 75 ? 'badge-success' : m.marks >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                                                    {m.marks >= 75 ? 'Pass' : m.marks >= 50 ? 'Average' : 'Fail'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No marks recorded yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
};

export default StudentDetailPage;
