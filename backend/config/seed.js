const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// ─── Seed data ────────────────────────────────────────────────────────────────

const departments = [
    { id: 1, name: 'Artificial Intelligence and Data Science', code: 'AIDS' },
    { id: 2, name: 'Artificial Intelligence and Machine Learning', code: 'AIML' },
    { id: 3, name: 'Civil Engineering', code: 'CIV' },
    { id: 4, name: 'Mechanical Engineering', code: 'MECH' },
    { id: 5, name: 'Computer Science Engineering', code: 'CSE' },
    { id: 6, name: 'Electronics and Communication Engineering', code: 'ECE' },
    { id: 7, name: 'Electrical and Electronics Engineering', code: 'EEE' },
    { id: 8, name: 'Information Technology', code: 'IT' },
];

// 4 subjects per department per semester (1–8)
const subjectTemplates = {
    AIDS: [
        ['Engineering Mathematics', 'Python for Data Science', 'Problem Solving Techniques', 'Engineering Physics'],
        ['Statistics for Data Science', 'Database Management', 'Data Structures', 'Object Oriented Programming'],
        ['Machine Learning Fundamentals', 'Big Data Analytics', 'Probability Models', 'Web Technologies'],
        ['Deep Learning', 'Data Visualization', 'Natural Language Processing', 'Cloud Computing'],
        ['Reinforcement Learning', 'AI Ethics and Governance', 'Computer Vision', 'Data Engineering'],
        ['Advanced ML Models', 'Time Series Analysis', 'MLOps', 'Distributed Systems'],
        ['Capstone Project I', 'Research Methodology', 'AI in Healthcare', 'Federated Learning'],
        ['Capstone Project II', 'Entrepreneurship', 'Advanced Data Science', 'Industry Internship']
    ],
    AIML: [
        ['Engineering Mathematics', 'Introduction to AI', 'Problem Solving with C', 'Engineering Chemistry'],
        ['Linear Algebra for ML', 'Object Oriented Programming', 'Data Structures', 'Probability & Statistics'],
        ['Machine Learning', 'Computer Vision Basics', 'Algorithm Design', 'Database Systems'],
        ['Deep Learning', 'NLP', 'Optimization Techniques', 'Cloud for ML'],
        ['Advanced Deep Learning', 'Generative AI', 'Model Deployment', 'AI System Design'],
        ['Robotics & AI', 'AI Security', 'Federated Learning', 'Edge AI'],
        ['Capstone Project I', 'Research Methodology', 'Explainable AI', 'AI Product Management'],
        ['Capstone Project II', 'Entrepreneurship', 'Emerging AI Technologies', 'Internship']
    ],
    CIV: [
        ['Engineering Mathematics I', 'Engineering Physics', 'Engineering Drawing', 'Environmental Science'],
        ['Engineering Mathematics II', 'Surveying', 'Fluid Mechanics I', 'Strength of Materials I'],
        ['Fluid Mechanics II', 'Soil Mechanics', 'Structural Analysis I', 'Building Materials'],
        ['Structural Analysis II', 'Concrete Technology', 'Transportation Engineering I', 'Hydraulics'],
        ['Foundation Engineering', 'Water Resources Engineering', 'Transportation Engineering II', 'Estimation'],
        ['Design of RCC Structures', 'Design of Steel Structures', 'Environmental Engineering', 'Town Planning'],
        ['Capstone Project I', 'Bridge Engineering', 'Smart Cities', 'Remote Sensing'],
        ['Capstone Project II', 'Internship', 'Earthquake Engineering', 'Advanced Structural Design']
    ],
    MECH: [
        ['Engineering Mathematics I', 'Engineering Physics', 'Engineering Drawing', 'Workshop Technology'],
        ['Engineering Mathematics II', 'Engineering Mechanics', 'Thermodynamics I', 'Material Science'],
        ['Fluid Mechanics', 'Manufacturing Processes', 'Strength of Materials', 'Thermodynamics II'],
        ['Heat Transfer', 'Machine Design I', 'Kinematics of Machinery', 'Metrology'],
        ['Design of Machine Elements', 'CAD/CAM', 'Automobile Engineering', 'Operations Research'],
        ['Dynamics of Machinery', 'Finite Element Analysis', 'Industrial Engineering', 'Robotics'],
        ['Capstone Project I', 'Mechatronics', 'Additive Manufacturing', 'Energy Engineering'],
        ['Capstone Project II', 'Internship', 'Advanced Manufacturing', 'Product Design']
    ],
    CSE: [
        ['Engineering Mathematics I', 'Engineering Physics', 'Problem Solving with C', 'Engineering Drawing'],
        ['Engineering Mathematics II', 'Data Structures', 'Digital Electronics', 'Object Oriented Programming'],
        ['Computer Organization', 'Discrete Mathematics', 'Database Management Systems', 'Operating Systems'],
        ['Computer Networks', 'Theory of Computation', 'Software Engineering', 'Web Technologies'],
        ['Compiler Design', 'Machine Learning', 'Cloud Computing', 'Information Security'],
        ['Artificial Intelligence', 'Big Data Analytics', 'Mobile App Development', 'Distributed Systems'],
        ['Capstone Project I', 'Internet of Things', 'Deep Learning', 'Research Methodology'],
        ['Capstone Project II', 'Internship', 'Blockchain Technology', 'Ethical Hacking']
    ],
    ECE: [
        ['Engineering Mathematics I', 'Engineering Physics', 'Electronic Devices', 'Engineering Drawing'],
        ['Engineering Mathematics II', 'Circuit Theory', 'Digital Electronics', 'Signals & Systems'],
        ['Analog Circuits', 'Digital Signal Processing', 'Electromagnetic Theory', 'Microprocessors'],
        ['Communication Systems', 'VLSI Design', 'Control Systems', 'Antenna Theory'],
        ['Wireless Communication', 'Embedded Systems', 'RF Engineering', 'Optical Communication'],
        ['Advanced Communication', 'IoT Systems', 'Image Processing', 'Satellite Communication'],
        ['Capstone Project I', '5G Technologies', 'Radar Systems', 'Research Methodology'],
        ['Capstone Project II', 'Internship', 'Quantum Communication', 'Advanced VLSI']
    ],
    EEE: [
        ['Engineering Mathematics I', 'Engineering Physics', 'Basic Electrical Engineering', 'Engineering Drawing'],
        ['Engineering Mathematics II', 'Circuit Analysis', 'Electric Machines I', 'Measurements'],
        ['Power Systems I', 'Electric Machines II', 'Control Systems', 'Power Electronics I'],
        ['Power Systems II', 'Power Electronics II', 'Switchgear & Protection', 'Signals & Systems'],
        ['High Voltage Engineering', 'Digital Control Systems', 'Renewable Energy Systems', 'Electric Drives'],
        ['Smart Grid', 'Flexible AC Transmission', 'IoT in Power Systems', 'Power Quality'],
        ['Capstone Project I', 'Microgrid Systems', 'Energy Management', 'Research Methodology'],
        ['Capstone Project II', 'Internship', 'Advanced Power Electronics', 'EV Technology']
    ],
    IT: [
        ['Engineering Mathematics I', 'Problem Solving with Python', 'Engineering Physics', 'Engineering Drawing'],
        ['Engineering Mathematics II', 'Data Structures', 'OOP with Java', 'Digital Electronics'],
        ['Database Management', 'Operating Systems', 'Computer Networks', 'Web Development'],
        ['Software Engineering', 'Information Security', 'Cloud Computing', 'Mobile App Development'],
        ['Data Science', 'Machine Learning', 'DevOps', 'IT Project Management'],
        ['Big Data', 'Blockchain', 'Microservices', 'AI Applications'],
        ['Capstone Project I', 'Ethical Hacking', 'Advanced Databases', 'Research Methodology'],
        ['Capstone Project II', 'Internship', 'Digital Transformation', 'Emerging Technologies']
    ],
};

// ─── Students per department (4 each = 32 total) ──────────────────────────────
// Password for all students: "student123"
const studentsByDept = {
    AIDS: [
        { name: 'Arjun Sharma', email: 'arjun.aids@university.edu', sem: 1, marks: [92, 88, 76, 84] },
        { name: 'Priya Menon', email: 'priya.aids@university.edu', sem: 1, marks: [78, 65, 82, 70] },
        { name: 'Rohan Iyer', email: 'rohan.aids@university.edu', sem: 1, marks: [55, 62, 48, 59] },
        { name: 'Sneha Pillai', email: 'sneha.aids@university.edu', sem: 1, marks: [95, 91, 89, 93] },
    ],
    AIML: [
        { name: 'Karthik Nair', email: 'karthik.aiml@university.edu', sem: 1, marks: [88, 74, 91, 67] },
        { name: 'Divya Rao', email: 'divya.aiml@university.edu', sem: 1, marks: [63, 70, 58, 75] },
        { name: 'Arun Kumar', email: 'arun.aiml@university.edu', sem: 1, marks: [45, 52, 38, 47] },
        { name: 'Meera Krishnan', email: 'meera.aiml@university.edu', sem: 1, marks: [82, 78, 85, 80] },
    ],
    CIV: [
        { name: 'Suresh Babu', email: 'suresh.civ@university.edu', sem: 1, marks: [70, 68, 74, 65] },
        { name: 'Anjali Singh', email: 'anjali.civ@university.edu', sem: 1, marks: [88, 92, 85, 90] },
        { name: 'Vijay Rajan', email: 'vijay.civ@university.edu', sem: 1, marks: [50, 44, 55, 48] },
        { name: 'Lakshmi Devi', email: 'lakshmi.civ@university.edu', sem: 1, marks: [76, 72, 80, 68] },
    ],
    MECH: [
        { name: 'Rahul Verma', email: 'rahul.mech@university.edu', sem: 1, marks: [82, 77, 85, 90] },
        { name: 'Pooja Sharma', email: 'pooja.mech@university.edu', sem: 1, marks: [60, 55, 63, 58] },
        { name: 'Sanjay Gupta', email: 'sanjay.mech@university.edu', sem: 1, marks: [93, 89, 95, 91] },
        { name: 'Nisha Patel', email: 'nisha.mech@university.edu', sem: 1, marks: [40, 45, 38, 42] },
    ],
    CSE: [
        { name: 'Vikram Reddy', email: 'vikram.cse@university.edu', sem: 1, marks: [91, 87, 93, 89] },
        { name: 'Ananya Das', email: 'ananya.cse@university.edu', sem: 1, marks: [72, 68, 76, 70] },
        { name: 'Deepak Joshi', email: 'deepak.cse@university.edu', sem: 1, marks: [58, 62, 55, 60] },
        { name: 'Kavitha Raman', email: 'kavitha.cse@university.edu', sem: 1, marks: [85, 82, 88, 84] },
    ],
    ECE: [
        { name: 'Manoj Tiwari', email: 'manoj.ece@university.edu', sem: 1, marks: [77, 83, 71, 79] },
        { name: 'Swathi Nair', email: 'swathi.ece@university.edu', sem: 1, marks: [94, 90, 92, 88] },
        { name: 'Prakash Gowda', email: 'prakash.ece@university.edu', sem: 1, marks: [48, 53, 44, 50] },
        { name: 'Rekha Suresh', email: 'rekha.ece@university.edu', sem: 1, marks: [65, 70, 62, 68] },
    ],
    EEE: [
        { name: 'Balaji Krishnan', email: 'balaji.eee@university.edu', sem: 1, marks: [86, 80, 84, 78] },
        { name: 'Usha Menon', email: 'usha.eee@university.edu', sem: 1, marks: [55, 60, 52, 57] },
        { name: 'Gopal Sharma', email: 'gopal.eee@university.edu', sem: 1, marks: [92, 95, 88, 91] },
        { name: 'Padma Ravi', email: 'padma.eee@university.edu', sem: 1, marks: [43, 39, 47, 41] },
    ],
    IT: [
        { name: 'Ramesh Babu', email: 'ramesh.it@university.edu', sem: 1, marks: [80, 75, 82, 78] },
        { name: 'Chitra Sundaram', email: 'chitra.it@university.edu', sem: 1, marks: [91, 88, 94, 86] },
        { name: 'Ajay Patel', email: 'ajay.it@university.edu', sem: 1, marks: [62, 58, 65, 60] },
        { name: 'Saranya Kumar', email: 'saranya.it@university.edu', sem: 1, marks: [47, 43, 50, 45] },
    ],
};

// ─── Seed runner ──────────────────────────────────────────────────────────────

async function seed() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        multipleStatements: true,
    });

    console.log('Connected for seeding...');

    // Always drop and recreate to avoid ANY duplicate data
    await conn.query(`DROP DATABASE IF EXISTS \`${process.env.DB_NAME}\``);
    await conn.query(`CREATE DATABASE \`${process.env.DB_NAME}\``);
    await conn.query(`USE \`${process.env.DB_NAME}\``);

    // Create tables with proper UNIQUE constraints
    await conn.query(`
    CREATE TABLE departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      department_name VARCHAR(150) NOT NULL UNIQUE
    );

    CREATE TABLE semesters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      semester_number INT NOT NULL,
      UNIQUE KEY unique_sem (semester_number)
    );

    CREATE TABLE subjects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject_name VARCHAR(150) NOT NULL,
      subject_code VARCHAR(20) NOT NULL UNIQUE,
      department_id INT NOT NULL,
      semester_id INT NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (semester_id) REFERENCES semesters(id)
    );

    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin','student') NOT NULL DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      student_name VARCHAR(100) NOT NULL,
      department_id INT NOT NULL,
      current_semester INT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (department_id) REFERENCES departments(id)
    );

    CREATE TABLE student_marks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      subject_id INT NOT NULL,
      marks INT NOT NULL,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id),
      UNIQUE KEY unique_mark (student_id, subject_id)
    );
  `);

    console.log('Tables created (fresh).');

    // Seed departments
    for (const dept of departments) {
        await conn.query('INSERT INTO departments (department_name) VALUES (?)', [dept.name]);
    }
    console.log('Departments seeded.');

    // Seed semesters 1–8
    for (let s = 1; s <= 8; s++) {
        await conn.query('INSERT INTO semesters (semester_number) VALUES (?)', [s]);
    }
    console.log('Semesters seeded.');

    // Seed subjects (4 per dept per semester = 256 total)
    for (const dept of departments) {
        const [deptRows] = await conn.query('SELECT id FROM departments WHERE department_name = ?', [dept.name]);
        const deptId = deptRows[0].id;
        const templates = subjectTemplates[dept.code];

        for (let semIdx = 0; semIdx < 8; semIdx++) {
            const semNum = semIdx + 1;
            const [semRows] = await conn.query('SELECT id FROM semesters WHERE semester_number = ?', [semNum]);
            const semId = semRows[0].id;
            const subjects = templates[semIdx];

            for (let subIdx = 0; subIdx < 4; subIdx++) {
                const subNum = String(subIdx + 1).padStart(2, '0');
                const code = `${dept.code}${semNum}${subNum}`;
                const name = subjects[subIdx];
                await conn.query(
                    'INSERT INTO subjects (subject_name, subject_code, department_id, semester_id) VALUES (?, ?, ?, ?)',
                    [name, code, deptId, semId]
                );
            }
        }
    }
    console.log('Subjects seeded (256 subjects).');

    // Seed admin
    const hash = await bcrypt.hash('admin123', 10);
    await conn.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin', 'admin@university.edu', hash, 'admin']
    );
    console.log('Admin user created: admin@university.edu / admin123');

    // Seed 32 students with marks
    console.log('Seeding students and marks...');
    const studentPassword = await bcrypt.hash('student123', 10);

    for (const dept of departments) {
        const [deptRows] = await conn.query('SELECT id FROM departments WHERE department_name = ?', [dept.name]);
        const deptId = deptRows[0].id;
        const students = studentsByDept[dept.code];

        const [semRows] = await conn.query('SELECT id FROM semesters WHERE semester_number = 1');
        const semId = semRows[0].id;
        const [subjects] = await conn.query(
            'SELECT id FROM subjects WHERE department_id = ? AND semester_id = ? ORDER BY id ASC',
            [deptId, semId]
        );

        for (const stu of students) {
            const [uRes] = await conn.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [stu.name, stu.email, studentPassword, 'student']
            );
            const [sRes] = await conn.query(
                'INSERT INTO students (user_id, student_name, department_id, current_semester) VALUES (?, ?, ?, ?)',
                [uRes.insertId, stu.name, deptId, stu.sem]
            );
            for (let i = 0; i < subjects.length; i++) {
                await conn.query(
                    'INSERT INTO student_marks (student_id, subject_id, marks) VALUES (?, ?, ?)',
                    [sRes.insertId, subjects[i].id, stu.marks[i]]
                );
            }
        }
        console.log(`  Seeded ${students.length} students for ${dept.code}`);
    }

    await conn.end();
    console.log('\n✅ Seeding complete! 32 students across 8 departments.');
    console.log('   Admin login: admin@university.edu / admin123');
    console.log('   Student login: e.g. arjun.aids@university.edu / student123\n');
}

module.exports = seed;

