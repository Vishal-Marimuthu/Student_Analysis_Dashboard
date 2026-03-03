import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Trophy, Medal } from 'lucide-react';
import { getGrade, getGradeColor } from '../utils/gradeUtils';

const API = 'http://localhost:5000/api';

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };

const DEPT_ABBR = {
    'Artificial Intelligence and Data Science': 'AIDS',
    'Artificial Intelligence and Machine Learning': 'AIML',
    'Civil Engineering': 'CIVIL',
    'Mechanical Engineering': 'MECH',
    'Computer Science Engineering': 'CSE',
    'Electronics and Communication Engineering': 'ECE',
    'Electrical and Electronics Engineering': 'EEE',
    'Information Technology': 'IT',
};

const RankingsPage = () => {
    const { token } = useAuth();
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeDept, setActiveDept] = useState('all');

    useEffect(() => {
        fetch(`${API}/admin/rankings`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => setRankings(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token]);

    // Unique department list from data
    const departments = [...new Map(rankings.map(r => [r.department_id, r.department_name])).entries()]
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const displayed = activeDept === 'all'
        ? rankings
        : rankings.filter(r => String(r.department_id) === activeDept);

    return (
        <Layout title="Rankings">
            <div className="page-header">
                <div>
                    <h2>Department Rankings</h2>
                    <p>Students ranked by average marks within their department</p>
                </div>
            </div>

            {/* Department tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button
                    className={`btn ${activeDept === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveDept('all')}
                >
                    All Departments
                </button>
                {departments.map(d => (
                    <button
                        key={d.id}
                        className={`btn ${activeDept === String(d.id) ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveDept(String(d.id))}
                    >
                        {DEPT_ABBR[d.name] ?? d.name.split(' ').filter(w => w[0] === w[0].toUpperCase()).map(w => w[0]).join('')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading">Loading rankings...</div>
            ) : (
                activeDept === 'all' ? (
                    /* All departments view — one card per dept */
                    departments.map(dept => {
                        const deptStudents = rankings.filter(r => r.department_id === dept.id);
                        return (
                            <div key={dept.id} className="card" style={{ marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                    <Trophy size={18} color="var(--primary)" />
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{dept.name}</span>
                                    <span className="badge badge-primary">{deptStudents.length} students</span>
                                </div>
                                <RankTable students={deptStudents} />
                            </div>
                        );
                    })
                ) : (
                    /* Single department view */
                    <div className="card">
                        <RankTable students={displayed} />
                    </div>
                )
            )}
        </Layout>
    );
};

const RankTable = ({ students }) => (
    <div className="table-wrap">
        <table>
            <thead>
                <tr>
                    <th style={{ width: 60 }}>Rank</th>
                    <th>Student</th>
                    <th>Semester</th>
                    <th>Avg Marks</th>
                    <th>Grade</th>
                </tr>
            </thead>
            <tbody>
                {students.map(s => (
                    <tr key={s.student_id} style={s.dept_rank <= 3 ? { background: 'rgba(99,102,241,0.06)' } : {}}>
                        <td style={{ fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}>
                            {MEDAL[s.dept_rank] || `#${s.dept_rank}`}
                        </td>
                        <td style={{ fontWeight: 600 }}>{s.student_name}</td>
                        <td style={{ color: 'var(--muted)' }}>Sem {s.current_semester}</td>
                        <td>
                            <strong>{s.avg_marks}</strong>
                            <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>/100</span>
                        </td>
                        <td>
                            <span className={`badge ${getGradeColor(s.avg_marks)}`} style={{ fontWeight: 700, letterSpacing: '0.03em' }}>
                                {getGrade(s.avg_marks)}
                            </span>
                        </td>
                    </tr>
                ))}
                {students.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No data available.</td></tr>
                )}
            </tbody>
        </table>
    </div>
);

export default RankingsPage;
