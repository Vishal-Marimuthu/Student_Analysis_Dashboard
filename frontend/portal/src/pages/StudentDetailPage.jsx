import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card3D from '../components/Card3D'; // Import Card3D
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { ArrowLeft, ShieldAlert, ShieldCheck, Star, BrainCircuit } from 'lucide-react';
import { getGrade, getGradeColor } from '../utils/gradeUtils';

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
        ]).then(([s, m]) => { setStudent(s && !s.error ? s : null); setMarks(Array.isArray(m) ? m : []); }).finally(() => setLoading(false));
    }, [id, token]);

    const semesters = [...new Set(marks.map(m => m.semester_number))].sort();
    const filtered = selSem === 'all' ? marks : marks.filter(m => String(m.semester_number) === selSem);
    const avgScore = filtered.length ? (filtered.reduce((a, m) => a + m.marks, 0) / filtered.length).toFixed(1) : 0;

    // AI Risk Profile Engine
    const getRiskProfile = (avg) => {
        if (avg >= 85) return { status: "Honors Track", color: "#10b981", icon: <Star size={24} color="#10b981" />, message: "Student is performing exceptionally well. Ensure they are engaged with advanced coursework or research opportunities." };
        if (avg >= 50) return { status: "Safe / On Track", color: "#3b82f6", icon: <ShieldCheck size={24} color="#3b82f6" />, message: "Student is maintaining acceptable grades. Keep monitoring for any sudden drops in core subjects." };
        return { status: "At Risk", color: "#ef4444", icon: <ShieldAlert size={24} color="#ef4444" />, message: "Student is struggling significantly. Immediate intervention and 1-on-1 tutoring is highly recommended." };
    };
    const risk = getRiskProfile(avgScore);

    // Gamification: Skill Tree Radar Data
    const skillDataMap = () => {
        const skillGroups = {
            'Technical': ['program', 'data', 'computer', 'software', 'structure', 'web', 'app', 'base'],
            'Math & Logic': ['math', 'calculus', 'algebra', 'discrete', 'probability', 'logic'],
            'Infrastructure': ['network', 'system', 'cloud', 'os', 'operating', 'architecture'],
            'Science & Eng': ['physics', 'chemistry', 'science', 'electronics', 'circuit', 'mechanic']
        };

        const stats = { 'Technical': { t:0, c:0 }, 'Math & Logic': { t:0, c:0 }, 'Infrastructure': { t:0, c:0 }, 'Science & Eng': { t:0, c:0 }, 'Core/General': { t:0, c:0 } };

        marks.forEach(m => {
            let matched = false;
            const sn = m.subject_name.toLowerCase();
            for (const [skill, kws] of Object.entries(skillGroups)) {
                if (kws.some(kw => sn.includes(kw))) {
                    stats[skill].t += m.marks;
                    stats[skill].c += 1;
                    matched = true; break;
                }
            }
            if (!matched) { stats['Core/General'].t += m.marks; stats['Core/General'].c += 1; }
        });

        return Object.keys(stats).filter(k => stats[k].c > 0).map(k => ({
            skill: k, mastery: parseFloat((stats[k].t / stats[k].c).toFixed(1)), fullMark: 100
        }));
    };
    const skillData = skillDataMap();

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

                    {/* Profile card with 3D effect */}
                    <Card3D style={{ marginBottom: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0.5rem' }}>
                            <div>
                                <h2 style={{ marginBottom: '0.25rem', fontSize: '1.8rem' }}>{student.student_name}</h2>
                                <p style={{ color: '#a5b4fc', fontSize: '0.95rem' }}>{student.email}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                <span className="badge badge-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{student.department_name}</span>
                                <span className="badge badge-warning" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Sem {student.current_semester}</span>
                                <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Overall Avg: {avgScore}%</span>
                            </div>
                        </div>
                    </Card3D>

                    {/* Semester filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <button className={`btn ${selSem === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelSem('all')}>All</button>
                        {semesters.map(s => (
                            <button key={s} className={`btn ${selSem === String(s) ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelSem(String(s))}>
                                Sem {s}
                            </button>
                        ))}
                    </div>

                    {/* AI Risk Assessment */}
                    {filtered.length > 0 && (
                        <Card3D style={{ marginBottom: '1.5rem', background: `linear-gradient(to right, rgba(24,24,27,0.6), ${risk.color}15)`, borderLeft: `4px solid ${risk.color}` }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <div style={{ background: `${risk.color}20`, padding: '0.75rem', borderRadius: '50%', flexShrink: 0 }}>
                                    {risk.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ color: risk.color, marginBottom: '0.4rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <BrainCircuit size={18} /> AI Prediction: {risk.status}
                                    </h3>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        {risk.message}
                                    </p>
                                </div>
                            </div>
                        </Card3D>
                    )}

                    {/* Chart Grid */}
                    {filtered.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="card" style={{ height: '100%' }}>
                                <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Marks Overview</div>
                                <ResponsiveContainer width="100%" height={260}>
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

                            <div className="card" style={{ height: '100%' }}>
                                <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Skill Tree Proficiency
                                </div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={skillData}>
                                        <PolarGrid stroke="var(--border)" />
                                        <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Mastery" dataKey="mastery" stroke="#8b5cf6" fill="#a78bfa" fillOpacity={0.3} />
                                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
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
                                                <span className={`badge ${getGradeColor(m.marks)}`} style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.03em' }}>
                                                    {getGrade(m.marks)}
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
