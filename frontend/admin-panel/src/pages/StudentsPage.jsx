import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
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
            .then(r => r.json()).then(setStudents).catch(console.error).finally(() => setLoading(false));
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

            <div className="card">
                {loading ? <div className="loading">Loading students...</div> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Semester</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((s, i) => (
                                    <tr key={s.id}>
                                        <td style={{ color: 'var(--muted)' }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{s.student_name}</td>
                                        <td style={{ color: 'var(--muted)' }}>{s.email}</td>
                                        <td><span className="badge badge-primary">{s.department_name}</span></td>
                                        <td>Sem {s.current_semester}</td>
                                        <td>
                                            <button className="btn btn-ghost" style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                                                onClick={() => navigate(`/students/${s.id}`)}>
                                                <Eye size={14} /> View Marks
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>No students found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default StudentsPage;
