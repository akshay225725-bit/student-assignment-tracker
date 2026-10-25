
import { useEffect, useState } from 'react'
import './App.css'

// Connect to the hosted Render backend, not localhost.
const API_URL =
  'https://student-assignment-tracker-api-1w7i.onrender.com/api/assignments'

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'Medium',
  status: 'Pending',
}

async function readResponse(response) {
  const text = await response.text()
  let result = {}

  if (text) {
    try {
      result = JSON.parse(text)
    } catch {
      result = { message: text }
    }
  }

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed with status ${response.status}`
    )
  }

  return result
}

function App() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  async function loadAssignments() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(API_URL)
      const result = await readResponse(response)

      const data = Array.isArray(result)
        ? result
        : result.data || result.assignments || []

      setAssignments(data)
    } catch (err) {
      setError(
        `Cannot load assignments: ${err.message}. Check that your Render backend and API routes are working.`
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAssignments()
  }, [])

  function openNewForm() {
    setEditingId(null)
    setForm({ ...emptyForm })
    setError('')
    setShowForm(true)
  }

  function openEditForm(assignment) {
    setEditingId(assignment._id || assignment.id)

    setForm({
      title: assignment.title || '',
      description: assignment.description || '',
      dueDate: assignment.dueDate
        ? String(assignment.dueDate).slice(0, 10)
        : '',
      priority: assignment.priority || 'Medium',
      status: assignment.status || 'Pending',
    })

    setError('')
    setShowForm(true)
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          dueDate: form.dueDate || null,
        }),
      })

      await readResponse(response)

      setShowForm(false)
      setEditingId(null)
      setForm({ ...emptyForm })

      await loadAssignments()
    } catch (err) {
      setError(
        `Could not save assignment. Details: ${err.message}. Check that the Render API is reachable and allows requests from GitHub Pages.`
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteAssignment(assignment) {
    const id = assignment._id || assignment.id

    if (!id) {
      setError('This assignment does not have a valid ID.')
      return
    }

    const confirmed = window.confirm(
      `Delete "${assignment.title}"? This cannot be undone.`
    )

    if (!confirmed) return

    try {
      setError('')

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      await readResponse(response)
      await loadAssignments()
    } catch (err) {
      setError(`Could not delete assignment: ${err.message}`)
    }
  }

  const completed = assignments.filter(
    (item) => item.status === 'Completed'
  ).length

  const pending = assignments.filter(
    (item) => item.status === 'Pending'
  ).length

  const inProgress = assignments.filter(
    (item) => item.status === 'In Progress'
  ).length

  const visibleAssignments = assignments.filter((assignment) => {
    const matchesFilter =
      filter === 'All' || assignment.status === filter

    const query = search.toLowerCase()

    const matchesSearch =
      (assignment.title || '').toLowerCase().includes(query) ||
      (assignment.description || '').toLowerCase().includes(query)

    return matchesFilter && matchesSearch
  })

  function formatDate(date) {
    if (!date) return 'No deadline'

    const parsed = new Date(`${String(date).slice(0, 10)}T00:00:00`)

    if (Number.isNaN(parsed.getTime())) return 'No deadline'

    return parsed.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>StudyFlow</h2>
            <span>STUDENT WORKSPACE</span>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>

        <button
          className={`side-link ${filter === 'All' ? 'active' : ''}`}
          onClick={() => setFilter('All')}
        >
          <span>▦</span> Dashboard
        </button>

        <button
          className="side-link"
          onClick={() => setFilter('Pending')}
        >
          <span>◷</span> Pending tasks
        </button>

        <button
          className="side-link"
          onClick={() => setFilter('In Progress')}
        >
          <span>↗</span> In progress
        </button>

        <button
          className="side-link"
          onClick={() => setFilter('Completed')}
        >
          <span>✓</span> Completed
        </button>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Stay on track!</strong>
            <p>Small steps every day lead to big results.</p>
          </div>

          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <strong>Student</strong>
              <span>My workspace</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> Dashboard
          </div>

          <div className="topbar-right">
            <span className="online-dot" />
            <span>Study workspace</span>
            <div className="top-avatar">S</div>
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">YOUR PERSONAL STUDY SPACE</div>
            <h1>
              Make today <span>count.</span>
            </h1>
            <p>
              Organize your assignments, track your progress,
              and stay ahead of every deadline.
            </p>
          </div>

          <button className="primary-button" onClick={openNewForm}>
            <span>＋</span> New assignment
          </button>
        </section>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button
              aria-label="Dismiss error"
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total assignments</span>
              <div className="stat-icon purple">▤</div>
            </div>
            <div className="stat-number">{assignments.length}</div>
            <div className="stat-caption">All your assignments</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Pending</span>
              <div className="stat-icon orange">◷</div>
            </div>
            <div className="stat-number">{pending}</div>
            <div className="stat-caption">
              Waiting to be completed
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>In progress</span>
              <div className="stat-icon blue">↗</div>
            </div>
            <div className="stat-number">{inProgress}</div>
            <div className="stat-caption">
              Currently being worked on
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Completed</span>
              <div className="stat-icon green">✓</div>
            </div>
            <div className="stat-number">{completed}</div>
            <div className="stat-caption">Successfully finished</div>
          </div>
        </section>

        <section className="assignments-section">
          <div className="section-heading">
            <div>
              <h2>My assignments</h2>
              <p>Manage your tasks and upcoming deadlines.</p>
            </div>

            <button className="text-button" onClick={loadAssignments}>
              ↻ Refresh
            </button>
          </div>

          <div className="toolbar">
            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search assignments..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              aria-label="Filter assignments"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All assignments</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="empty-icon">↻</div>
              <h3>Loading assignments...</h3>
              <p>Please wait while we connect to your server.</p>
            </div>
          ) : visibleAssignments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h3>
                {search || filter !== 'All'
                  ? 'No matching assignments'
                  : 'No assignments yet'}
              </h3>
              <p>
                {search || filter !== 'All'
                  ? 'Try changing your search or filter.'
                  : 'Create your first assignment to get started.'}
              </p>

              {!search && filter === 'All' && (
                <button
                  className="primary-button"
                  onClick={openNewForm}
                >
                  ＋ Add assignment
                </button>
              )}
            </div>
          ) : (
            <div className="assignment-list">
              {visibleAssignments.map((assignment) => (
                <article
                  className="assignment-card"
                  key={assignment._id || assignment.id}
                >
                  <div className="assignment-mark">▤</div>

                  <div className="assignment-info">
                    <h3>{assignment.title}</h3>
                    <p>
                      {assignment.description ||
                        'No description provided.'}
                    </p>

                    <div className="assignment-meta">
                      <span>
                        ◷ Due: {formatDate(assignment.dueDate)}
                      </span>

                      <span
                        className={`priority priority-${(
                          assignment.priority || 'Medium'
                        ).toLowerCase()}`}
                      >
                        {assignment.priority || 'Medium'} priority
                      </span>
                    </div>
                  </div>

                  <div className="assignment-actions">
                    <span
                      className={`status status-${(
                        assignment.status || 'Pending'
                      )
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {assignment.status || 'Pending'}
                    </span>

                    <button
                      className="icon-button"
                      title="Edit assignment"
                      onClick={() => openEditForm(assignment)}
                    >
                      ✎
                    </button>

                    <button
                      className="icon-button delete-button"
                      title="Delete assignment"
                      onClick={() => deleteAssignment(assignment)}
                    >
                      ×
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="footer">
          StudyFlow <span>·</span> Stay organized. Keep learning.
        </footer>
      </main>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false)
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-title"
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">ASSIGNMENT DETAILS</div>
                <h2 id="form-title">
                  {editingId ? 'Edit assignment' : 'New assignment'}
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                Assignment title *
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Data Structures Lab"
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Add some details..."
                  rows="3"
                />
              </label>

              <label>
                Due date
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </label>

              <div className="form-row">
                <label>
                  Priority
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                  </select>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save changes'
                      : 'Create assignment'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
