/* =====================================================
   TASK MANAGER APPLICATION - FULL STACK (SINGLE FILE)
   Backend: Node.js + Express + MongoDB + JWT + bcrypt
   Frontend: React (via CDN) embedded as one HTML string
   ===================================================== */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- CONFIG ----------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_key_in_production';

// ---------- DATABASE ----------
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// ---------- SCHEMAS ----------
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});
const Task = mongoose.model('Task', taskSchema);

// ---------- AUTH MIDDLEWARE ----------
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// ---------- AUTH ROUTES ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please fill in all fields.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: 'A user with this email already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration.', error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Please fill in all fields.' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login.', error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// ---------- TASK ROUTES (PROTECTED) ----------
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching tasks.', error: err.message });
  }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, priority, dueDate, status } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ message: 'Task title is required.' });

    const task = await Task.create({ user: req.userId, title, description, priority, dueDate, status });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating task.', error: err.message });
  }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const { title, description, priority, dueDate, status } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating task.', error: err.message });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting task.', error: err.message });
  }
});

// ---------- FRONTEND (React app embedded as HTML) ----------
const FRONTEND_HTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Task Manager</title>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --primary: #4f46e5; --primary-dark: #4338ca; --success: #16a34a;
    --danger: #dc2626; --warning: #d97706; --bg: #f3f4f6; --card: #ffffff;
    --text: #1f2937; --muted: #6b7280; --border: #e5e7eb;
  }
  body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }
  a { text-decoration: none; color: inherit; }
  button { cursor: pointer; font-family: inherit; }
  input, select, textarea { font-family: inherit; }

  .auth-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
  .auth-card { background: var(--card); padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); width: 100%; max-width: 400px; }
  .auth-card h1 { font-size: 26px; margin-bottom: 6px; text-align: center; color: var(--primary); }
  .auth-card p.subtitle { text-align: center; color: var(--muted); margin-bottom: 24px; font-size: 14px; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
  .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px; font-size: 14px; outline: none; }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); }
  .btn { display: inline-block; padding: 11px 20px; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
  .btn-primary { background: var(--primary); color: #fff; width: 100%; }
  .btn-primary:hover { background: var(--primary-dark); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-danger { background: var(--danger); color: #fff; }
  .btn-small { padding: 6px 12px; font-size: 12px; }
  .auth-switch { text-align: center; margin-top: 18px; font-size: 13px; color: var(--muted); }
  .auth-switch span { color: var(--primary); font-weight: 600; cursor: pointer; }

  .alert { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
  .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
  .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }

  .navbar { background: var(--card); padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,0.08); position: sticky; top: 0; z-index: 10; }
  .navbar h2 { color: var(--primary); font-size: 20px; }
  .navbar .user-info { display: flex; align-items: center; gap: 14px; font-size: 14px; }
  .navbar .user-info .avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }

  .container { max-width: 1100px; margin: 0 auto; padding: 24px 20px 60px; }

  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 24px; }
  .stat-card { background: var(--card); padding: 16px; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); text-align: center; }
  .stat-card .num { font-size: 26px; font-weight: 700; color: var(--primary); }
  .stat-card .label { font-size: 12px; color: var(--muted); margin-top: 4px; }

  .toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; align-items: center; }
  .toolbar input[type="text"] { flex: 1; min-width: 180px; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 14px; }
  .toolbar select { padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border); font-size: 14px; background: #fff; }

  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 100; }
  .modal-box { background: var(--card); border-radius: 14px; padding: 28px; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; }
  .modal-box h3 { margin-bottom: 18px; color: var(--primary); }
  .form-row { display: flex; gap: 12px; }
  .form-row .form-group { flex: 1; }
  .modal-actions { display: flex; gap: 10px; margin-top: 6px; }
  .modal-actions .btn { flex: 1; }

  .task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .task-card { background: var(--card); border-radius: 12px; padding: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); border-left: 5px solid var(--primary); display: flex; flex-direction: column; gap: 8px; }
  .task-card.priority-High { border-left-color: var(--danger); }
  .task-card.priority-Medium { border-left-color: var(--warning); }
  .task-card.priority-Low { border-left-color: var(--success); }
  .task-card .task-title { font-size: 16px; font-weight: 700; }
  .task-card .task-desc { font-size: 13px; color: var(--muted); }
  .task-card .task-meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; margin-top: 4px; }
  .badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-Pending { background: #fef3c7; color: #92400e; }
  .badge-InProgress { background: #dbeafe; color: #1e40af; }
  .badge-Completed { background: #dcfce7; color: #166534; }
  .badge-High { background: #fee2e2; color: #991b1b; }
  .badge-Medium { background: #fef9c3; color: #854d0e; }
  .badge-Low { background: #e0f2fe; color: #075985; }
  .task-card .task-actions { display: flex; gap: 8px; margin-top: 10px; }

  .empty-state { text-align: center; padding: 60px 20px; color: var(--muted); }
  .empty-state h3 { margin-bottom: 6px; color: var(--text); }

  .loading-wrap { display: flex; align-items: center; justify-content: center; padding: 60px; flex-direction: column; gap: 10px; }
  .spinner { width: 34px; height: 34px; border: 4px solid var(--border); border-top: 4px solid var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  select#statusSelect { font-size: 12px; padding: 5px 8px; border-radius: 6px; border: 1px solid var(--border); }

  @media (max-width: 600px) {
    .navbar { flex-direction: column; gap: 10px; align-items: flex-start; }
    .form-row { flex-direction: column; }
    .container { padding: 16px 12px 50px; }
  }
</style>
</head>
<body>
<div id="root"></div>
<script type="text/babel">
const { useState, useEffect } = React;
const API_BASE = '/api';

async function apiRequest(path, options) {
  options = options || {};
  const token = localStorage.getItem('token');
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
  const data = await res.json().catch(function () { return {}; });
  if (!res.ok) throw new Error((data && data.message) ? data.message : 'Something went wrong');
  return data;
}

function Alert(props) {
  if (!props.message) return null;
  return <div className={props.type === 'success' ? 'alert alert-success' : 'alert alert-error'}>{props.message}</div>;
}

function LoginPage(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!email.trim()) return 'Email is required.';
    if (!/^\\S+@\\S+\\.\\S+$/.test(email)) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(''); setLoading(true);
    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      props.onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Task Manager</h1>
        <p className="subtitle">Login to manage your tasks</p>
        <Alert message={error} type="error" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="text" value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={function(e){setPassword(e.target.value);}} placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="auth-switch">Don't have an account? <span onClick={props.onSwitchToRegister}>Register here</span></p>
      </div>
    </div>
  );
}

function RegisterPage(props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!name.trim()) return 'Name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!/^\\S+@\\S+\\.\\S+$/.test(email)) return 'Enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); setSuccess(''); return; }
    setError(''); setLoading(true);
    try {
      const data = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess('Account created successfully!');
      setTimeout(function () { props.onLoginSuccess(data.user); }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Sign up to start organizing your tasks</p>
        <Alert message={error} type="error" />
        <Alert message={success} type="success" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={function(e){setName(e.target.value);}} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="text" value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={function(e){setPassword(e.target.value);}} placeholder="At least 6 characters" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={function(e){setConfirmPassword(e.target.value);}} placeholder="Re-enter password" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>
        <p className="auth-switch">Already have an account? <span onClick={props.onSwitchToLogin}>Login here</span></p>
      </div>
    </div>
  );
}

function TaskFormModal(props) {
  const editingTask = props.editingTask;
  const [title, setTitle] = useState(editingTask ? editingTask.title : '');
  const [description, setDescription] = useState(editingTask ? editingTask.description : '');
  const [priority, setPriority] = useState(editingTask ? editingTask.priority : 'Medium');
  const [dueDate, setDueDate] = useState(editingTask && editingTask.dueDate ? editingTask.dueDate.substring(0, 10) : '');
  const [status, setStatus] = useState(editingTask ? editingTask.status : 'Pending');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError('Task title is required.'); return; }
    setError(''); setSaving(true);
    const payload = { title, description, priority, dueDate: dueDate || null, status };
    try {
      if (editingTask) {
        const updated = await apiRequest('/tasks/' + editingTask._id, { method: 'PUT', body: JSON.stringify(payload) });
        props.onSaved(updated, true);
      } else {
        const created = await apiRequest('/tasks', { method: 'POST', body: JSON.stringify(payload) });
        props.onSaved(created, false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={function(e){ if(e.target.className === 'modal-overlay') props.onClose(); }}>
      <div className="modal-box">
        <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
        <Alert message={error} type="error" />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input type="text" value={title} onChange={function(e){setTitle(e.target.value);}} placeholder="e.g. Finish internship report" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="3" value={description} onChange={function(e){setDescription(e.target.value);}} placeholder="Add more details..."></textarea>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={function(e){setPriority(e.target.value);}}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={status} onChange={function(e){setStatus(e.target.value);}}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={function(e){setDueDate(e.target.value);}} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={props.onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : (editingTask ? 'Update Task' : 'Add Task')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskCard(props) {
  const task = props.task;
  function formatDate(d) {
    if (!d) return 'No due date';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return (
    <div className={'task-card priority-' + task.priority}>
      <div className="task-title">{task.title}</div>
      {task.description ? <div className="task-desc">{task.description}</div> : null}
      <div className="task-meta">
        <span className={'badge badge-' + task.priority}>{task.priority} Priority</span>
        <span className={'badge badge-' + task.status.replace(' ', '')}>{task.status}</span>
        <span className="badge" style={{background:'#f3f4f6', color:'#374151'}}>Due: {formatDate(task.dueDate)}</span>
      </div>
      <div className="task-actions">
        <select id="statusSelect" value={task.status} onChange={function(e){ props.onQuickStatusChange(task, e.target.value); }}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button className="btn btn-outline btn-small" onClick={function(){ props.onEdit(task); }}>Edit</button>
        <button className="btn btn-danger btn-small" onClick={function(){ props.onDelete(task); }}>Delete</button>
      </div>
    </div>
  );
}

function Dashboard(props) {
  const user = props.user;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(function () { loadTasks(); }, []);

  function flashSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(function () { setSuccessMsg(''); }, 2500);
  }

  async function loadTasks() {
    setLoading(true); setError('');
    try {
      const data = await apiRequest('/tasks');
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSaved(task, wasEdit) {
    if (wasEdit) {
      setTasks(function (prev) { return prev.map(function (t) { return t._id === task._id ? task : t; }); });
      flashSuccess('Task updated successfully!');
    } else {
      setTasks(function (prev) { return [task].concat(prev); });
      flashSuccess('Task added successfully!');
    }
    setShowModal(false);
    setEditingTask(null);
  }

  async function handleDelete(task) {
    if (!window.confirm('Delete "' + task.title + '"? This cannot be undone.')) return;
    try {
      await apiRequest('/tasks/' + task._id, { method: 'DELETE' });
      setTasks(function (prev) { return prev.filter(function (t) { return t._id !== task._id; }); });
      flashSuccess('Task deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleQuickStatusChange(task, newStatus) {
    try {
      const updated = await apiRequest('/tasks/' + task._id, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      setTasks(function (prev) { return prev.map(function (t) { return t._id === updated._id ? updated : t; }); });
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    props.onLogout();
  }

  const filteredTasks = tasks.filter(function (t) {
    const matchesSearch = t.title.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
      (t.description || '').toLowerCase().indexOf(search.toLowerCase()) !== -1;
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tasks.length,
    pending: tasks.filter(function (t) { return t.status === 'Pending'; }).length,
    inProgress: tasks.filter(function (t) { return t.status === 'In Progress'; }).length,
    completed: tasks.filter(function (t) { return t.status === 'Completed'; }).length
  };

  return (
    <div>
      <nav className="navbar">
        <h2>📋 Task Manager</h2>
        <div className="user-info">
          <span>Hi, {user.name}</span>
          <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          <button className="btn btn-outline btn-small" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="container">
        <Alert message={error} type="error" />
        <Alert message={successMsg} type="success" />
        <div className="stats-row">
          <div className="stat-card"><div className="num">{stats.total}</div><div className="label">Total Tasks</div></div>
          <div className="stat-card"><div className="num">{stats.pending}</div><div className="label">Pending</div></div>
          <div className="stat-card"><div className="num">{stats.inProgress}</div><div className="label">In Progress</div></div>
          <div className="stat-card"><div className="num">{stats.completed}</div><div className="label">Completed</div></div>
        </div>
        <div className="toolbar">
          <input type="text" placeholder="🔍 Search tasks by title or description..." value={search} onChange={function(e){ setSearch(e.target.value); }} />
          <select value={statusFilter} onChange={function(e){ setStatusFilter(e.target.value); }}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={priorityFilter} onChange={function(e){ setPriorityFilter(e.target.value); }}>
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button className="btn btn-primary" onClick={function(){ setEditingTask(null); setShowModal(true); }}>+ Add Task</button>
        </div>
        {loading ? (
          <div className="loading-wrap"><div className="spinner"></div><p>Loading your tasks...</p></div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>{tasks.length === 0 ? 'Click "Add Task" to create your first task.' : 'Try adjusting your search or filters.'}</p>
          </div>
        ) : (
          <div className="task-grid">
            {filteredTasks.map(function (task) {
              return (
                <TaskCard key={task._id} task={task}
                  onEdit={function(t){ setEditingTask(t); setShowModal(true); }}
                  onDelete={handleDelete}
                  onQuickStatusChange={handleQuickStatusChange} />
              );
            })}
          </div>
        )}
      </div>
      {showModal ? (
        <TaskFormModal editingTask={editingTask} onClose={function(){ setShowModal(false); setEditingTask(null); }} onSaved={handleSaved} />
      ) : null}
    </div>
  );
}

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(function () {
    async function checkAuth() {
      const token = localStorage.getItem('token');
      if (!token) { setCheckingAuth(false); return; }
      try {
        const data = await apiRequest('/auth/me');
        setUser(data.user);
        setView('dashboard');
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  function handleLoginSuccess(loggedInUser) { setUser(loggedInUser); setView('dashboard'); }
  function handleLogout() { setUser(null); setView('login'); }

  if (checkingAuth) {
    return <div className="loading-wrap" style={{minHeight:'100vh'}}><div className="spinner"></div><p>Loading...</p></div>;
  }
  if (view === 'dashboard' && user) return <Dashboard user={user} onLogout={handleLogout} />;
  if (view === 'register') return <RegisterPage onLoginSuccess={handleLoginSuccess} onSwitchToLogin={function(){ setView('login'); }} />;
  return <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToRegister={function(){ setView('register'); }} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
</script>
</body>
</html>
`;

app.get(/^\/(?!api).*/, (req, res) => {
  res.send(FRONTEND_HTML);
});

// ---------- ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Task Manager server running at http://localhost:${PORT}`);
});