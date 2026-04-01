import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { getGrade, getGradeColor } from '../utils/gradeUtils';
import { Sparkles, TrendingUp, Target, Award } from 'lucide-react';

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

    // Gamification: Level and XP
    const totalMarks = marks.reduce((acc, m) => acc + m.marks, 0);
    const level = Math.floor(totalMarks / 400) + 1;
    const currentXP = totalMarks % 400;
    const xpPercentage = (currentXP / 400) * 100;

    // Gamification: Skill Tree Radar Data
    const skillDataMap = () => {
        const skillGroups = {
            'Technical': ['program', 'data', 'computer', 'software', 'structure', 'web', 'app', 'base'],
            'Math & Logic': ['math', 'calculus', 'algebra', 'discrete', 'probability', 'logic'],
            'Infrastructure': ['network', 'system', 'cloud', 'os', 'operating', 'architecture'],
            'Science & Eng': ['physics', 'chemistry', 'science', 'electronics', 'circuit', 'mechanic']
        };

        const stats = { 'Technical': { t: 0, c: 0 }, 'Math & Logic': { t: 0, c: 0 }, 'Infrastructure': { t: 0, c: 0 }, 'Science & Eng': { t: 0, c: 0 }, 'Core/General': { t: 0, c: 0 } };

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

    // Generate Trajectory Data
    const trajectoryData = semNums.map(sem => {
        const semMarks = marks.filter(m => m.semester_number === sem);
        const semAvg = semMarks.length ? (semMarks.reduce((a, m) => a + m.marks, 0) / semMarks.length).toFixed(1) : 0;
        return { name: `Sem ${sem}`, average: parseFloat(semAvg) };
    });

    // Generate AI Summary
    const generateSummary = () => {
        if (!marks.length) return "I don't have enough data to analyze your performance yet. Complete some exams to see your insights!";

        const sortedMarks = [...marks].sort((a, b) => b.marks - a.marks);
        const highest = sortedMarks[0];
        const lowest = sortedMarks[sortedMarks.length - 1];

        let intro = `You have an overall average of ${avg} across ${filtered.length} subjects. `;
        let strength = highest ? `You are excelling in ${highest.subject_name} with a stellar score of ${highest.marks}. ` : '';
        let weakness = lowest && lowest.marks < 70 ? `Consider putting extra revision time into ${lowest.subject_name} (currently ${lowest.marks}). ` : 'You are maintaining solid scores across the board! ';

        let rankText = '';
        if (rank && rank.rank) {
            const percentile = (rank.rank / rank.total_students) * 100;
            if (percentile <= 10) rankText = `Outstanding! You are in the top 10% of the ${profile?.department_name || ''} department. `;
            else if (percentile <= 25) rankText = `Great job, you are in the top 25% of your department. `;
        }

        return intro + strength + weakness + rankText;
    };


    return (
        <Layout title="My Dashboard">
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card" style={{ height: '100px', background: 'var(--bg3)', animation: 'pulse 2s infinite' }}></div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div className="card" style={{ height: '120px', background: 'var(--bg3)', animation: 'pulse 2s infinite', animationDelay: '0.2s' }}></div>
                        <div className="card" style={{ height: '120px', background: 'var(--bg3)', animation: 'pulse 2s infinite', animationDelay: '0.4s' }}></div>
                        <div className="card" style={{ height: '120px', background: 'var(--bg3)', animation: 'pulse 2s infinite', animationDelay: '0.6s' }}></div>
                        <div className="card" style={{ height: '120px', background: 'var(--bg3)', animation: 'pulse 2s infinite', animationDelay: '0.8s' }}></div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Profile & XP Bar */}
                    {profile && (
                        <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(to right, rgba(24, 24, 27, 0.4), rgba(16, 185, 129, 0.05))', borderColor: 'var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                                        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>{profile.student_name}</h2>
                                        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)' }}>
                                            LVL {level}
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{profile.email}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span className="badge badge-primary">{profile.department_name}</span>
                                    <span className="badge badge-warning">Semester {profile.current_semester}</span>
                                    {rank && rank.rank && (
                                        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                                            <Award size={14} /> Dept Rank #{rank.rank} of {rank.total_students}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* XP Progress Bar */}
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.4rem', fontWeight: 500 }}>
                                    <span>XP Progress</span>
                                    <span>{currentXP} / 400 XP to Level {level + 1}</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${xpPercentage}%`,
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #34d399, #10b981)',
                                        borderRadius: '4px',
                                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)',
                                        transition: 'width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="stat-grid">
                        <div className="stat-card">
                            <div className="label">Subjects Recorded</div>
                            <div className="value" style={{ color: '#34d399' }}>{filtered.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">Average Marks</div>
                            <div className="value" style={{ color: '#818cf8' }}>{avg}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">Subjects Passed</div>
                            <div className="value" style={{ color: '#f59e0b' }}>{passed}</div>
                        </div>
                        {rank && rank.rank && (
                            <div className="stat-card" style={{ background: 'linear-gradient(to bottom right, rgba(39, 39, 42, 0.4), rgba(16, 185, 129, 0.1))', borderColor: 'rgba(52, 211, 153, 0.2)' }}>
                                <div className="label" style={{ color: '#a7f3d0' }}>Dept Rank</div>
                                <div className="value" style={{ color: '#fff' }}>#{rank.rank}<span style={{ fontSize: '0.8rem', color: '#6ee7b7', fontWeight: 400 }}> / {rank.total_students}</span></div>
                            </div>
                        )}
                    </div>

                    {/* AI Summary */}
                    <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '4px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.1 }}>
                            <Sparkles size={120} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', fontWeight: 700, color: '#fff' }}>
                            <Sparkles size={18} color="var(--primary-hover)" /> AI Performance Summary
                        </div>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>
                            {generateSummary()}
                        </p>
                    </div>

                    {/* Charts Grid */}
                    {filtered.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                            {/* Bar Chart Overview */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                                    <Target size={18} color="var(--primary-hover)" /> Current Semester Marks
                                </div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <BarChart data={filtered} margin={{ top: 0, right: 10, left: -20, bottom: 55 }}>
                                        <XAxis dataKey="subject_code" tick={{ fontSize: 11, fill: 'var(--muted)' }} angle={-35} textAnchor="end" />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#18181b', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Bar dataKey="marks" radius={[4, 4, 0, 0]}>
                                            {filtered.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Trajectory Chart */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                                    <TrendingUp size={18} color="var(--info)" /> Academic Trajectory
                                </div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <LineChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--muted)' }} />
                                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid var(--border)', borderRadius: 8 }} />
                                        <Line type="monotone" dataKey="average" stroke="var(--info)" strokeWidth={3} dot={{ fill: 'var(--bg)', stroke: 'var(--info)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Skill Tree Radar */}
                            <div className="card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                                    <Award size={18} color="var(--warning)" /> Skill Tree Proficiency
                                </div>
                                <ResponsiveContainer width="100%" height={240}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={skillData}>
                                        <PolarGrid stroke="var(--border)" />
                                        <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-dim)', fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Mastery" dataKey="mastery" stroke="#10b981" fill="#34d399" fillOpacity={0.3} />
                                        <Tooltip contentStyle={{ background: '#18181b', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Semester filters */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        <button className={`btn ${selSem === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelSem('all')} style={{ padding: '0.5rem 1rem' }}>All Semesters</button>
                        {semNums.map(s => (
                            <button key={s} className={`btn ${selSem === String(s) ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSelSem(String(s))} style={{ padding: '0.5rem 1rem' }}>
                                Sem {s}
                            </button>
                        ))}
                    </div>

                    {/* Marks table */}
                    <div className="card">
                        <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>Subject Marks Record</div>
                        {filtered.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
                                <Award size={48} opacity={0.2} style={{ margin: '0 auto 1rem auto', display: 'block' }} />
                                <p>No marks recorded yet for this selection.</p>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr><th>Subject</th><th>Code</th><th>Sem</th><th>Marks</th><th>Status</th></tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(m => (
                                            <tr key={m.id}>
                                                <td style={{ fontWeight: 500, color: '#fff' }}>{m.subject_name}</td>
                                                <td>{m.subject_code}</td>
                                                <td>Sem {m.semester_number}</td>
                                                <td><strong style={{ color: '#fff' }}>{m.marks}</strong><span style={{ color: 'var(--muted)' }}>/100</span></td>
                                                <td>
                                                    <span className={`badge ${getGradeColor(m.marks)}`}>
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
