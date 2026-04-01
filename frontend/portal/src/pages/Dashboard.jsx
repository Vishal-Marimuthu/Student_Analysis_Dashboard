import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import Card3D from '../components/Card3D';
import { Users, LayoutDashboard, TrendingUp, AlertTriangle, Trophy } from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';

const API = 'http://localhost:5000/api';

const Dashboard = () => {
    const { token } = useAuth();
    const [students, setStudents] = useState([]);
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            fetch(`${API}/admin/students`, { headers }).then(r => r.json()),
            fetch(`${API}/admin/rankings`, { headers }).then(r => r.json())
        ])
            .then(([sData, rData]) => {
                setStudents(Array.isArray(sData) ? sData : []);
                setRankings(Array.isArray(rData) ? rData : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    // Group by department for basic stats
    const deptCounts = students.reduce((acc, s) => {
        acc[s.department_name] = (acc[s.department_name] || 0) + 1;
        return acc;
    }, {});

    // Process rankings for insights & radar chart
    const insightData = () => {
        if (!rankings.length) return null;

        const topStudents = rankings.slice(0, 3);

        // Calculate average per department
        const deptStats = rankings.reduce((acc, r) => {
            if (!acc[r.department_name]) acc[r.department_name] = { total: 0, count: 0 };
            acc[r.department_name].total += parseFloat(r.avg_marks);
            acc[r.department_name].count += 1;
            return acc;
        }, {});

        const radarData = Object.keys(deptStats).map(dept => ({
            department: dept,
            average: parseFloat((deptStats[dept].total / deptStats[dept].count).toFixed(1)),
            fullMark: 100
        }));

        const lowestDept = radarData.reduce((prev, curr) => prev.average < curr.average ? prev : curr, radarData[0] || {});
        const highestDept = radarData.reduce((prev, curr) => prev.average > curr.average ? prev : curr, radarData[0] || {});

        return { topStudents, radarData, lowestDept, highestDept };
    };

    const insights = insightData();

    return (
        <Layout title="Dashboard">
            {/* Search/Command Bar Simulation */}
            <div style={{
                background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '0.75rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                color: 'var(--muted)'
            }}>
                <LayoutDashboard size={18} />
                <span style={{ fontSize: '0.95rem' }}>Press <kbd style={{ background: 'var(--bg3)', padding: '0.1rem 0.4rem', borderRadius: 4, margin: '0 0.2rem' }}>Cmd + K</kbd> to search students or datasets...</span>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <div className="label">Total Students</div>
                    <div className="value" style={{ color: '#818cf8' }}>{students.length}</div>
                </div>
                <div className="stat-card">
                    <div className="label">Departments</div>
                    <div className="value" style={{ color: '#34d399' }}>{Object.keys(deptCounts).length}</div>
                </div>
                <div className="stat-card">
                    <div className="label">Active Semesters</div>
                    <div className="value" style={{ color: '#fbbf24' }}>8</div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="card" style={{ height: '300px', background: 'var(--bg3)', animation: 'pulse 2s infinite' }}></div>
                    <div className="card" style={{ height: '300px', background: 'var(--bg3)', animation: 'pulse 2s infinite', animationDelay: '0.5s' }}></div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

                    {/* Radar Chart */}
                    <Card3D style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                            <TrendingUp size={18} style={{ color: 'var(--primary-hover)' }} /> Department Performance
                        </div>
                        {insights?.radarData?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={insights.radarData}>
                                    <PolarGrid stroke="var(--border)" />
                                    <PolarAngleAxis dataKey="department" tick={{ fill: 'var(--muted)', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--border)' }} />
                                    <Radar name="Avg Marks" dataKey="average" stroke="#818cf8" fill="#6366f1" fillOpacity={0.4} />
                                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--muted)', gap: '1rem' }}>
                                <Users size={48} opacity={0.2} />
                                <span>Not enough data to map performance.</span>
                            </div>
                        )}
                    </Card3D>

                    {/* AI Smart Insights */}
                    <Card3D style={{ height: '100%', background: 'linear-gradient(to bottom right, rgba(24, 24, 27, 0.4), rgba(39, 39, 42, 0.2))' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                            ✨ Smart Insights Engine
                        </div>

                        {insights ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                {insights.lowestDept && (
                                    <div style={{ display: 'flex', gap: '1rem', background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--danger)' }}>
                                        <AlertTriangle size={20} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Attention Needed: {insights.lowestDept.department}</h4>
                                            <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>This department currently holds the lowest average across the university at <strong>{insights.lowestDept.average}</strong> marks. Consider reviewing their curriculum load.</p>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary-hover)' }}>
                                    <Trophy size={20} color="var(--primary-hover)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ width: '100%' }}>
                                        <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.5rem' }}>University Leaderboard</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {insights.topStudents.map((s, i) => (
                                                <div key={s.student_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                                    <span style={{ color: 'var(--text-dim)' }}>#{i + 1} {s.student_name}</span>
                                                    <span className="badge badge-primary">{s.avg_marks} avg</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {insights.highestDept && (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '0.5rem' }}>
                                        🚀 {insights.highestDept.department} is leading with an impressive {insights.highestDept.average} average.
                                    </p>
                                )}

                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--muted)', gap: '1rem' }}>
                                <span>Add student marks to generate insights.</span>
                            </div>
                        )}
                    </Card3D>
                </div>
            )}
            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 0.2; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </Layout>
    );
};

export default Dashboard;
