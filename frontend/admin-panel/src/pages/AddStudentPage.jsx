import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { UserPlus } from 'lucide-react';

const API = 'http://localhost:5000/api';

const AddStudentPage = () => {
    const { token } = useAuth();
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', departmentId: '', currentSemester: '' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`${API}/admin/departments`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(setDepartments).catch(console.error);
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(null);
        try {
            const res = await fetch(`${API}/admin/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...form, departmentId: Number(form.departmentId), currentSemester: Number(form.currentSemester) }),
            });
            const data = await res.json();
            if (!res.ok) { setMessage({ type: 'error', text: data.message }); return; }
            setMessage({ type: 'success', text: `Student added! They can now login with their email and password.` });
            setForm({ name: '', email: '', password: '', departmentId: '', currentSemester: '' });
        } catch { setMessage({ type: 'error', text: 'Server error.' }); }
        finally { setLoading(false); }
    };

    const f = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    return (
        <Layout title="Add Student">
            <div style={{ maxWidth: 560 }}>
                <div className="page-header">
                    <div><h2>Add New Student</h2><p>Create a student account with department and semester</p></div>
                </div>

                <div className="card">
                    {message && <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group"><label>Full Name</label>
                            <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="e.g. John Doe" required />
                        </div>
                        <div className="form-group"><label>Email</label>
                            <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="student@university.edu" required />
                        </div>
                        <div className="form-group"><label>Password</label>
                            <input type="password" value={form.password} onChange={e => f('password', e.target.value)} placeholder="Initial password" required />
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Department</label>
                                <select value={form.departmentId} onChange={e => f('departmentId', e.target.value)} required>
                                    <option value="">Select department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Current Semester</label>
                                <select value={form.currentSemester} onChange={e => f('currentSemester', e.target.value)} required>
                                    <option value="">Select semester</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                            <UserPlus size={16} /> {loading ? 'Adding...' : 'Add Student'}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AddStudentPage;
