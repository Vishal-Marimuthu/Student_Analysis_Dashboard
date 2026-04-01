import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card3D from '../components/Card3D';
import { Eye } from 'lucide-react';

const API = 'http://localhost:5000/api';

const StudentsPage = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API}/admin/students`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(data => setStudents(Array.isArray(data) ? data : [])).catch(console.error).finally(() => setLoading(false));
    }, [token]);

    const filtered = students.filter(s =>
        s.student_name.toLowerCase().includes(search.toLowerCase()) ||
        s.department_name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout title="All Students">
            <div className="page-header">
                <div>
                    <h2>Students</h2>
                    <p>{students.length} total students enrolled</p>
                </div>
                <input placeholder="Search name, dept, email..." value={search}
                    onChange={e => setSearch(e.target.value)} style={{ width: 260 }} />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                {loading ? (
                    <div className="stagger-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card" style={{ height: '220px', background: 'var(--bg3)', animation: 'pulse 2s infinite', animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                ) : (
                    <div className="stagger-grid">
                        {filtered.map((s, i) => {
                            // Predict a gamified Level based on semester
                            // If they are in Sem 4, they are probably around Level 8-10.
                            const simulatedLevel = (s.current_semester * 2) + (s.id % 3);
                            // Simulate XP progress
                            const xpPercentage = ((s.id * 47) % 400) / 400 * 100;

                            return (
                                <div key={s.id} className="stagger-item">
                                    <Card3D style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(139, 92, 246, 0.15)', background: 'linear-gradient(145deg, rgba(24, 24, 27, 0.8), rgba(39, 39, 42, 0.4))' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                <div>
                                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{s.student_name}</h3>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{s.email}</p>
                                                </div>
                                                <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)' }}>
                                                    LVL {simulatedLevel}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                                <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>{s.department_name}</span>
                                                <span className="badge badge-warning" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Sem {s.current_semester}</span>
                                            </div>

                                            {/* XP Progress Miniature */}
                                            <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '0.3rem', fontWeight: 600 }}>
                                                    <span>XP Progress</span>
                                                </div>
                                                <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        width: `${xpPercentage}%`, 
                                                        height: '100%', 
                                                        background: 'linear-gradient(90deg, #a78bfa, #8b5cf6)', 
                                                        borderRadius: '2px',
                                                        boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)'
                                                    }} />
                                                </div>
                                            </div>
                                        </div>

                                        <button className="btn btn-ghost" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)' }}
                                            onClick={() => navigate(`/students/${s.id}`)}>
                                            <Eye size={16} /> Inspect Profile
                                        </button>
                                    </Card3D>
                                </div>
                            );
                        })}
                        
                        {filtered.length === 0 && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--muted)', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                                <p>No students found matching your search.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default StudentsPage;
