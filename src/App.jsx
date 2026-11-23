import { useCallback, useEffect, useMemo, useState } from 'react';
import { employeeApi } from './api.js';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  joiningDate: '',
  status: 'Active',
};

const departments = ['Engineering', 'Design', 'Marketing', 'Human Resources', 'Finance', 'Sales', 'Operations'];

function Icon({ name, size = 20 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    phone: <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.8a2 2 0 0 1-.6 1.7L7.7 9.5a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.7-.6l2.8.5a2 2 0 0 1 1.5 2.8Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6" /><path d="M10 11v5m4-5v5" /></>,
    arrow: <><path d="M5 12h14m-7-7 7 7-7 7" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function getPageFromHash() {
  const page = window.location.hash.slice(1);
  return ['overview', 'employees', 'analytics', 'support', 'settings'].includes(page) ? page : 'employees';
}

function SummaryCards({ stats }) {
  return (
    <section className="stats-grid" aria-label="Employee summary">
      <article className="stat-card"><div className="stat-top"><span className="stat-label">Total employees</span><span className="stat-icon purple"><Icon name="users" size={19} /></span></div><div className="stat-value">{stats.total}<span className="stat-note"> team members</span></div><div className="stat-foot"><span className="stat-indicator" />Updated just now</div></article>
      <article className="stat-card"><div className="stat-top"><span className="stat-label">Active employees</span><span className="stat-icon green"><i className="status-dot" /></span></div><div className="stat-value">{stats.active}<span className="stat-note"> currently active</span></div><div className="stat-foot"><span className="stat-indicator green-indicator" />Across your organization</div></article>
      <article className="stat-card"><div className="stat-top"><span className="stat-label">Departments</span><span className="stat-icon orange"><Icon name="briefcase" size={18} /></span></div><div className="stat-value">{stats.departments}<span className="stat-note"> represented</span></div><div className="stat-foot">Unique departments in your team</div></article>
    </section>
  );
}

function DepartmentBreakdown({ departments }) {
  const maxCount = Math.max(1, ...departments.map((department) => department.count));

  if (departments.length === 0) {
    return <div className="chart-empty">Add employees to see department breakdowns.</div>;
  }

  return (
    <div className="department-breakdown">
      {departments.map((department) => (
        <div className="department-row" key={department.name}>
          <div className="department-row-label"><span><span className="department-mark">{department.name.charAt(0)}</span>{department.name}</span><strong>{department.count}</strong></div>
          <div className="department-track"><span style={{ width: `${(department.count / maxCount) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function EmployeeForm({ employee, onClose, onSave, saving }) {
  const [form, setForm] = useState(employee
    ? { ...employee, joiningDate: new Date(employee.joiningDate).toISOString().slice(0, 10) }
    : initialForm);
  const [error, setError] = useState('');
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog form-dialog" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="dialog-heading">
          <div><p className="eyebrow">TEAM DIRECTORY</p><h2 id="form-title">{employee ? 'Edit employee' : 'Add employee'}</h2><p className="muted">Fill in the details below to {employee ? 'update this record' : 'create a new record'}.</p></div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field full"><span>Full name</span><input name="name" value={form.name} onChange={change} placeholder="e.g. Alex Morgan" required minLength="2" maxLength="80" autoFocus /></label>
            <label className="field"><span>Email address</span><input type="email" name="email" value={form.email} onChange={change} placeholder="alex@company.com" required /></label>
            <label className="field"><span>Phone number</span><input type="tel" name="phone" value={form.phone} onChange={change} placeholder="+1 (555) 000-0000" required /></label>
            <label className="field"><span>Department</span><select name="department" value={form.department} onChange={change} required><option value="" disabled>Select department</option>{departments.map((department) => <option key={department}>{department}</option>)}{form.department && !departments.includes(form.department) && <option>{form.department}</option>}</select></label>
            <label className="field"><span>Designation</span><input name="designation" value={form.designation} onChange={change} placeholder="e.g. Product Designer" required maxLength="80" /></label>
            <label className="field"><span>Joining date</span><input type="date" name="joiningDate" value={form.joiningDate} onChange={change} max={new Date().toISOString().slice(0, 10)} required /></label>
            <label className="field"><span>Status</span><select name="status" value={form.status} onChange={change}><option>Active</option><option>Inactive</option></select></label>
          </div>
          <div className="dialog-actions"><button type="button" className="button button-outline" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : employee ? 'Save changes' : 'Add employee'}</button></div>
        </form>
      </section>
    </div>
  );
}

function EmployeeDetails({ employee, onClose, onEdit }) {
  if (!employee) return null;
  return (
    <div className="overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="dialog details-dialog" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <div className="details-cover"><button className="icon-button close-on-cover" onClick={onClose} aria-label="Close details"><Icon name="close" /></button></div>
        <div className="details-avatar">{initials(employee.name)}</div>
        <div className="details-main">
          <span className={`status-badge ${employee.status.toLowerCase()}`}><i />{employee.status}</span>
          <h2 id="details-title">{employee.name}</h2>
          <p className="muted">{employee.designation} <span className="dot-separator">·</span> {employee.department}</p>
        </div>
        <div className="details-grid">
          <div className="detail-item"><span><Icon name="mail" size={17} />EMAIL ADDRESS</span><strong>{employee.email}</strong></div>
          <div className="detail-item"><span><Icon name="phone" size={17} />PHONE NUMBER</span><strong>{employee.phone}</strong></div>
          <div className="detail-item"><span><Icon name="briefcase" size={17} />DEPARTMENT</span><strong>{employee.department}</strong></div>
          <div className="detail-item"><span><Icon name="calendar" size={17} />JOINING DATE</span><strong>{formatDate(employee.joiningDate)}</strong></div>
        </div>
        <div className="details-footer"><button className="button button-outline" onClick={onClose}>Close</button><button className="button button-primary" onClick={() => onEdit(employee)}><Icon name="edit" size={16} /> Edit profile</button></div>
      </section>
    </div>
  );
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [activePage, setActivePage] = useState(getPageFromHash);
  const [adminName, setAdminName] = useState(() => localStorage.getItem('peopledesk-admin-name') || 'Anand Raj Bharti');
  const [profileName, setProfileName] = useState(adminName);
  const [settingsError, setSettingsError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [modal, setModal] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const updatePage = () => setActivePage(getPageFromHash());
    window.addEventListener('hashchange', updatePage);
    return () => window.removeEventListener('hashchange', updatePage);
  }, []);

  useEffect(() => {
    if (activePage !== 'employees') {
      setSearch('');
      setStatusFilter('');
    }
  }, [activePage]);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      setEmployees(await employeeApi.list({ search, status: statusFilter }));
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(loadEmployees, search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadEmployees, search]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((employee) => employee.status === 'Active').length,
    departments: new Set(employees.map((employee) => employee.department)).size,
  }), [employees]);
  const departmentCounts = useMemo(() => {
    const counts = employees.reduce((result, employee) => {
      result.set(employee.department, (result.get(employee.department) || 0) + 1);
      return result;
    }, new Map());
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((first, second) => second.count - first.count || first.name.localeCompare(second.name));
  }, [employees]);
  const recentEmployees = useMemo(() => [...employees]
    .sort((first, second) => new Date(second.joiningDate) - new Date(first.joiningDate))
    .slice(0, 5), [employees]);
  const activeRate = stats.total ? Math.round((stats.active / stats.total) * 100) : 0;
  const inactiveRate = stats.total ? 100 - activeRate : 0;

  async function saveEmployee(data) {
    setSaving(true);
    try {
      if (modal?.type === 'edit') await employeeApi.update(modal.employee._id, data);
      else await employeeApi.create(data);
      setModal(null);
      setToast(modal?.type === 'edit' ? 'Employee updated successfully.' : 'Employee added successfully.');
      await loadEmployees();
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(employee) {
    if (!window.confirm(`Delete ${employee.name} from the team? This action cannot be undone.`)) return;
    setActiveMenu(null);
    try {
      await employeeApi.remove(employee._id);
      setToast('Employee removed successfully.');
      await loadEmployees();
    } catch (error) {
      setPageError(error.message);
    }
  }

  function saveProfile(event) {
    event.preventDefault();
    const name = profileName.trim();
    if (name.length < 2) {
      setSettingsError('Display name must be at least 2 characters.');
      return;
    }

    try {
      localStorage.setItem('peopledesk-admin-name', name);
      setAdminName(name);
      setProfileName(name);
      setSettingsError('');
      setToast('Profile settings saved.');
    } catch (error) {
      console.error('Unable to save profile settings:', error);
      setSettingsError('Could not save settings in this browser. Check your browser storage permissions and try again.');
    }
  }

  const showEdit = (employee) => setModal({ type: 'edit', employee });
  const avatarColors = ['lavender', 'mint', 'peach', 'blue', 'rose'];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="PeopleDesk home"><span className="brand-mark"><Icon name="users" size={21} /></span><span>people<span className="brand-light">desk</span></span></a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation" aria-label="Main navigation">
          <a className={`nav-item ${activePage === 'overview' ? 'selected' : ''}`} href="#overview" aria-label="Overview" aria-current={activePage === 'overview' ? 'page' : undefined}><Icon name="grid" size={18} /><span>Overview</span></a>
          <a className={`nav-item ${activePage === 'employees' ? 'selected' : ''}`} href="#employees" aria-label="Employees" aria-current={activePage === 'employees' ? 'page' : undefined}><Icon name="users" size={18} /><span>Employees</span><span className="nav-count">{employees.length}</span></a>
          <a className={`nav-item ${activePage === 'analytics' ? 'selected' : ''}`} href="#analytics" aria-label="Analytics" aria-current={activePage === 'analytics' ? 'page' : undefined}><Icon name="chart" size={18} /><span>Analytics</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon">?</span><strong>Need a hand?</strong><p>Visit our help center to learn more.</p><a href="#support" aria-label="Get support">Get support <Icon name="arrow" size={14} /></a></div>
          <a className={`nav-item settings-button ${activePage === 'settings' ? 'selected' : ''}`} href="#settings" aria-label="Settings" aria-current={activePage === 'settings' ? 'page' : undefined}><Icon name="settings" size={18} /><span>Settings</span></a>
          <div className="account-row"><div className="account-avatar">{initials(adminName)}</div><div className="account-meta"><strong>{adminName}</strong><span>Administrator</span></div><button className="icon-button account-more" aria-label="Account options"><Icon name="more" size={18} /></button></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumbs">Workspace <Icon name="chevron" size={15} /> <strong>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</strong></div><div className="topbar-actions"><span className="today-label">{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span><button className="icon-button notification-button" aria-label="Notifications"><Icon name="bell" size={19} /><i /></button><div className="topbar-divider" /><div className="topbar-user"><div className="account-avatar small">{initials(adminName)}</div><span>{adminName}</span></div></div></header>
        <div className="page-wrap">
          {pageError && <div className="page-error" role="alert"><span>{pageError}</span><button onClick={loadEmployees}>Try again</button></div>}
          {activePage === 'overview' && <>
            <section className="page-heading"><div><div className="eyebrow">PEOPLE OPERATIONS <span className="heading-dot">•</span> OVERVIEW</div><h1>Welcome back, <span>{adminName.split(/\s+/)[0]}.</span></h1><p>Here’s what’s happening with your team today.</p></div><a className="button button-primary add-button" href="#employees"><Icon name="users" size={17} /> View employees</a></section>
            <SummaryCards stats={stats} />
            <div className="overview-grid">
              <section className="insight-card"><div className="insight-heading"><div><h2>Team by department</h2><p>Employee distribution across departments.</p></div><a href="#analytics" className="text-link">View analytics <Icon name="arrow" size={14} /></a></div><DepartmentBreakdown departments={departmentCounts.slice(0, 5)} /></section>
              <section className="insight-card"><div className="insight-heading"><div><h2>Recent joiners</h2><p>Your newest team members.</p></div><a href="#employees" className="text-link">View all <Icon name="arrow" size={14} /></a></div>
                {recentEmployees.length === 0 ? <div className="chart-empty">Your recent hires will appear here.</div> : <div className="recent-list">{recentEmployees.map((employee, index) => <button className="recent-employee" key={employee._id} onClick={() => setModal({ type: 'details', employee })}><span className={`employee-avatar ${avatarColors[index % avatarColors.length]}`}>{initials(employee.name)}</span><span className="recent-identity"><strong>{employee.name}</strong><small>{employee.designation}</small></span><span className="recent-date">{formatDate(employee.joiningDate)}</span></button>)}</div>}
              </section>
            </div>
          </>}
          {activePage === 'analytics' && <>
            <section className="page-heading"><div><div className="eyebrow">PEOPLE OPERATIONS <span className="heading-dot">•</span> ANALYTICS</div><h1>Your team, <span>in numbers.</span></h1><p>Explore your workforce by status and department.</p></div><a className="button button-outline add-button" href="#employees"><Icon name="users" size={17} /> Employee directory</a></section>
            <SummaryCards stats={stats} />
            <div className="analytics-grid">
              <section className="insight-card status-analytics"><div className="insight-heading"><div><h2>Employee status</h2><p>Active and inactive team members.</p></div></div>
                <div className="status-chart-wrap"><div className="status-chart" style={{ background: stats.total ? `conic-gradient(#49b47d 0% ${activeRate}%, #e8e7ef ${activeRate}% 100%)` : '#e8e7ef' }}><div><strong>{stats.total}</strong><span>employees</span></div></div><div className="status-legend"><div><span className="legend-key active-key" /> <span>Active</span><strong>{stats.active}</strong><small>{activeRate}%</small></div><div><span className="legend-key inactive-key" /> <span>Inactive</span><strong>{stats.total - stats.active}</strong><small>{inactiveRate}%</small></div></div></div>
              </section>
              <section className="insight-card"><div className="insight-heading"><div><h2>Headcount by department</h2><p>Compare the size of each department.</p></div></div><DepartmentBreakdown departments={departmentCounts} /></section>
            </div>
          </>}
          {activePage === 'support' && <>
            <section className="page-heading"><div><div className="eyebrow">PEOPLE OPERATIONS <span className="heading-dot">•</span> HELP CENTER</div><h1>How can we <span>help?</span></h1><p>Find quick guidance or get in touch with the PeopleDesk support team.</p></div></section>
            <div className="support-grid">
              <section className="insight-card"><span className="support-icon"><Icon name="users" size={20} /></span><h2>Managing employees</h2><p>Add and update team records from the Employees page. Use the row menu to view, edit, or remove a record.</p><a className="text-link" href="#employees">Open employee directory <Icon name="arrow" size={14} /></a></section>
              <section className="insight-card"><span className="support-icon"><Icon name="chart" size={20} /></span><h2>Team insights</h2><p>Overview and Analytics summarize employee status, department totals, and recent joiners from your directory.</p><a className="text-link" href="#analytics">Open analytics <Icon name="arrow" size={14} /></a></section>
              <section className="insight-card contact-card"><span className="support-icon"><Icon name="mail" size={20} /></span><h2>Contact support</h2><p>Send us a message and include what you were doing when you encountered an issue.</p><a className="button button-primary" href="mailto:support@peopledesk.app?subject=PeopleDesk%20Support">Email support <Icon name="arrow" size={14} /></a><small>Opens your default email application.</small></section>
            </div>
          </>}
          {activePage === 'settings' && <>
            <section className="page-heading"><div><div className="eyebrow">PEOPLE OPERATIONS <span className="heading-dot">•</span> PREFERENCES</div><h1>Workspace <span>settings.</span></h1><p>Manage your administrator profile and workspace preferences.</p></div><a className="button button-outline add-button" href="#support">Get support <Icon name="arrow" size={14} /></a></section>
            <div className="settings-grid">
              <section className="insight-card">
                <div className="insight-heading"><div><h2>Administrator profile</h2><p>Your display name is saved in this browser.</p></div></div>
                <div className="profile-summary"><div className="account-avatar profile-avatar">{initials(adminName)}</div><div><strong>{adminName}</strong><span>Administrator</span></div></div>
                <form className="profile-form" onSubmit={saveProfile}>
                  <label className="field"><span>Display name</span><input name="displayName" value={profileName} onChange={(event) => setProfileName(event.target.value)} minLength="2" maxLength="80" required /></label>
                  {settingsError && <div className="form-error" role="alert">{settingsError}</div>}
                  <button type="submit" className="button button-primary">Save profile</button>
                </form>
              </section>
              <section className="insight-card"><div className="insight-heading"><div><h2>Workspace information</h2><p>Application details for this workspace.</p></div></div>
                <div className="workspace-info"><div><span>Workspace</span><strong>PeopleDesk</strong></div><div><span>Employee data</span><strong>MongoDB database</strong></div><div><span>Access level</span><strong>Administrator</strong></div></div>
              </section>
            </div>
          </>}
          {activePage === 'employees' && <>
          <section className="page-heading"><div><div className="eyebrow">PEOPLE OPERATIONS <span className="heading-dot">•</span> DIRECTORY</div><h1>Your people, <span>at a glance.</span></h1><p>Manage your team and keep all your employee information in one place.</p></div><button className="button button-primary add-button" onClick={() => setModal({ type: 'create' })}><Icon name="plus" size={18} /> Add employee</button></section>

          <SummaryCards stats={stats} />

          <section className="directory-card" id="employees">
            <div className="directory-heading"><div><h2>All employees <span className="total-pill">{employees.length}</span></h2><p>A complete list of everyone on your team.</p></div><button className="button button-outline export-button" onClick={() => setToast('Export is not available yet.')}><span className="export-symbol">↓</span> Export</button></div>
            <div className="toolbar"><label className="search-box"><Icon name="search" size={18} /><input type="search" placeholder="Search employees..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search employees" /><kbd>⌘ K</kbd></label><div className="filters"><label className="status-filter"><span>Status:</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></label><button className="filter-button" onClick={() => { setSearch(''); setStatusFilter(''); }} aria-label="Clear filters"><span>↕</span> Filters</button></div></div>
            <div className="table-scroll">
              <table className="employee-table">
                <thead><tr><th>EMPLOYEE</th><th>DEPARTMENT</th><th>DESIGNATION</th><th>JOINING DATE</th><th>STATUS</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {loading && <tr><td colSpan="6"><div className="loading-state"><span className="spinner" />Loading employees…</div></td></tr>}
                  {!loading && !pageError && employees.map((employee, index) => (
                    <tr key={employee._id} onClick={() => setModal({ type: 'details', employee })}>
                      <td><div className="employee-cell"><div className={`employee-avatar ${avatarColors[index % avatarColors.length]}`}>{initials(employee.name)}</div><div className="employee-identity"><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td>
                      <td><span className="department-label"><span className="department-mark">{employee.department.charAt(0)}</span>{employee.department}</span></td>
                      <td className="designation-cell">{employee.designation}</td>
                      <td className="date-cell">{formatDate(employee.joiningDate)}</td>
                      <td><span className={`status-badge ${employee.status.toLowerCase()}`}><i />{employee.status}</span></td>
                      <td><div className="row-actions" onClick={(event) => event.stopPropagation()}><button className="icon-button row-more" aria-label={`Actions for ${employee.name}`} onClick={(event) => { event.stopPropagation(); setActiveMenu(activeMenu === employee._id ? null : employee._id); }}><Icon name="more" size={19} /></button>{activeMenu === employee._id && <div className="action-menu" onClick={(event) => event.stopPropagation()}><button onClick={() => { setActiveMenu(null); setModal({ type: 'details', employee }); }}>View details</button><button onClick={() => { setActiveMenu(null); showEdit(employee); }}>Edit employee</button><button className="danger-action" onClick={() => deleteEmployee(employee)}>Delete employee</button></div>}</div></td>
                    </tr>
                  ))}
                  {!loading && !pageError && employees.length === 0 && <tr><td colSpan="6"><div className="empty-state"><div className="empty-icon"><Icon name="users" size={23} /></div><strong>{search || statusFilter ? 'No matching employees' : 'Your team starts here'}</strong><p>{search || statusFilter ? 'Try another search or clear your filters.' : 'Add your first employee to get your directory up and running.'}</p>{!search && !statusFilter && <button className="button button-primary" onClick={() => setModal({ type: 'create' })}><Icon name="plus" size={17} /> Add your first employee</button>}</div></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing <strong>{employees.length}</strong> {employees.length === 1 ? 'employee' : 'employees'}</span><span className="footer-note"><span className="footer-live-dot" /> All changes saved</span></div>
          </section>
          </>}
          <footer className="page-footer"><span>© {new Date().getFullYear()} PeopleDesk</span><span>Made for teams that care about people <span className="footer-heart">♥</span></span></footer>
        </div>
      </main>
      {modal?.type === 'create' || modal?.type === 'edit' ? <EmployeeForm employee={modal.employee} onClose={() => setModal(null)} onSave={saveEmployee} saving={saving} /> : null}
      {modal?.type === 'details' ? <EmployeeDetails employee={modal.employee} onClose={() => setModal(null)} onEdit={(employee) => showEdit(employee)} /> : null}
      {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}
