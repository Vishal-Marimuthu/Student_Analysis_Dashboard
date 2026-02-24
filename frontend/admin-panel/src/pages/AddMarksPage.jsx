import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Save } from 'lucide-react';

const API = 'http://localhost:5000/api';

const AddMarksPage = () => {
    const { token } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [marks, setMarks] = useState({});   // { subjectId: value }

    const [selDept, setSelDept] = useState('');
    const [selSem, setSelSem] = useState('');
    const [selStudent, setSelStudent] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const hdr = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetch(`${API}/admin/departments`, { headers: hdr }).then(r => r.json()).then(setDepartments);
        fetch(`${API}/admin/semesters`, { headers: hdr }).then(r => r.json()).then(setSemesters);
        fetch(`${API}/admin/students`, { headers: hdr }).then(r => r.json()).then(setStudents);
    }, []);

    // When dept + sem selected → load subjects
    useEffect(() => {
        if (!selDept || !selSem) { setSubjects([]); setMarks({}); return; }
        fetch(`${API}/admin/subjects?departmentId=${selDept}&semesterId=${selSem}`, { headers: hdr })
            .then(r => r.json()).then(data => { setSubjects(data); setMarks({}); });
    }, [selDept, selSem]);

    // When student selected → prefill existing marks
    useEffect(() => {
        if (!selStudent || !selDept || !selSem) return;
        fetch(`${API}/admin/students/${selStudent}/marks`, { headers: hdr })
            .then(r => r.json()).then(data => {
                const pre = {};
                data.forEach(m => {
                    if (subjects.find(s => s.id === m.subject_id)) pre[m.subject_id] = m.marks;
                });
                setMarks(pre);
            });
    }, [selStudent, subjects]);

    // Filter students by dept + sem
    const filteredStudents = students.filter(s =>
        (!selDept || String(s.department_id) === selDept) &&
        (!selSem || String(s.current_semester) === String(semesters.find(sem => String(sem.id) === selSem)?.semester_number))
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selStudent || subjects.length === 0) return setMessage({ type: 'error', text: 'Select student and subjects first.' });
        setLoading(true); setMessage(null);
        const marksArray = subjects.map(s => ({ subjectId: s.id, marks: Number(marks[s.id] ?? 0) }));
        try {
            const res = await fetch(`${API}/admin/marks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...hdr },
                body: JSON.stringify({ studentId: Number(selStudent), marks: marksArray }),
            });
            const data = await res.json();
            setMessage({ type: res.ok ? 'success' : 'error', text: data.message });
        } catch { setMessage({ type: 'error', text: 'Server error.' }); }
        finally { setLoading(false); }
    };

    return (
        <Layout title="Add Marks">
            <div style={{ maxWidth: 680 }}>
                <div className="page-header">
                    <div><h2>Add / Update Marks</h2><p>Select department → semester → student, then enter marks</p></div>
                </div>

                <div className="card">
                    {message && <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: dept + sem */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>1. Department</label>
                                <select value={selDept} onChange={e => { setSelDept(e.target.value); setSelStudent(''); }} required>
                                    <option value="">Select department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>2. Semester</label>
                                <select value={selSem} onChange={e => { setSelSem(e.target.value); setSelStudent(''); }} required>
                                    <option value="">Select semester</option>
                                    {semesters.map(s => <option key={s.id} value={s.id}>Semester {s.semester_number}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Step 2: student */}
                        {selDept && selSem && (
                            <div className="form-group">
                                <label>3. Student</label>
                                <select value={selStudent} onChange={e => setSelStudent(e.target.value)} required>
                                    <option value="">Select student</option>
                                    {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.student_name} — {s.email}</option>)}
                                </select>
                                {filteredStudents.length === 0 && (
                                    <small style={{ color: 'var(--warning)' }}>No students found for this dept/semester combination.</small>
                                )}
                            </div>
                        )}

                        {/* Step 3: marks */}
                        {subjects.length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--muted)', display: 'block', marginBottom: '0.75rem' }}>4. Enter Marks (0–100)</label>
                                <div className="marks-grid">
                                    {subjects.map(sub => (
                                        <div className="marks-row" key={sub.id}>
                                            <div className="subject-info">
                                                <strong>{sub.subject_name}</strong>
                                                <span>{sub.subject_code}</span>
                                            </div>
                                            <input type="number" min={0} max={100}
                                                value={marks[sub.id] ?? ''}
                                                onChange={e => setMarks(prev => ({ ...prev, [sub.id]: e.target.value }))}
                                                placeholder="Marks" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {subjects.length > 0 && (
                            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '1.25rem' }}>
                                <Save size={16} /> {loading ? 'Saving...' : 'Save Marks'}
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AddMarksPage;
