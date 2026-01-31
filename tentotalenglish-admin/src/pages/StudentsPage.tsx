import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import "./students.css";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20h9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M3 6h18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4h8v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 6l1 16h10l1-16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StudentsPage() {
  const [items, setItems] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const load = async () => {
    const res = await http.get<Student[]>("/students");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setError(null);
    try {
      await http.post("/students", { firstName, lastName, email });
      setFirstName("");
      setLastName("");
      setEmail("");
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error creating student");
    }
  };

  const startEdit = (s: Student) => {
    setError(null);
    setEditingId(s.id);
    setEditFirstName(s.firstName);
    setEditLastName(s.lastName);
    setEditEmail(s.email);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFirstName("");
    setEditLastName("");
    setEditEmail("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError(null);
    try {
      await http.put(`/api/students/${editingId}`, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
      });
      cancelEdit();
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error updating student");
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      const ok = confirm("Delete this student?");
      if (!ok) return;

      await http.delete(`/api/students/${id}`);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error deleting student");
    }
  };

  const isEditing = (id: string) => editingId === id;

  // UI-only footer text (no pagination logic yet)
  const footerText = useMemo(() => {
    const total = items.length;
    return `Showing ${total} of ${total} results`;
  }, [items.length]);

  return (
    <div className="students-page">
      <div className="students-head">
        <h1 className="students-title">Students</h1>
      </div>

      <div className="students-card">
        {/* Create */}
        <div className="students-create">
          <input
            className="students-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
          <input
            className="students-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
          <input
            className="students-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <button className="students-add" onClick={create}>
            Add
          </button>
        </div>

        {error && <div className="students-error">{String(error)}</div>}

        <div className="students-table-wrap">
          <table className="students-table">
            <thead>
              <tr>
                <th>First</th>
                <th>Last</th>
                <th>Email</th>
                <th className="mono">ID</th>
                <th className="right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td>
                    {isEditing(s.id) ? (
                      <input
                        className="students-cell-input"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                      />
                    ) : (
                      s.firstName
                    )}
                  </td>

                  <td>
                    {isEditing(s.id) ? (
                      <input
                        className="students-cell-input"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                      />
                    ) : (
                      s.lastName
                    )}
                  </td>

                  <td>
                    {isEditing(s.id) ? (
                      <input
                        className="students-cell-input"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    ) : (
                      s.email
                    )}
                  </td>

                  <td className="mono">{s.id}</td>

                  <td className="right">
                    <div className="students-actions">
                      {isEditing(s.id) ? (
                        <>
                          <button className="students-action secondary" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="students-action ghost" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="students-action edit" onClick={() => startEdit(s)}>
                            <PencilIcon />
                            Edit
                          </button>
                          <button className="students-action delete" onClick={() => remove(s.id)}>
                            <TrashIcon />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="students-empty" colSpan={5}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="students-footer">
          <div className="students-foot-left">{footerText}</div>

          <div className="students-pager">
            <button className="pager-btn" disabled title="Previous page">
              ‹
            </button>
            <div className="pager-mid">
              <span className="pager-page">1</span>
              <span className="pager-of">of</span>
              <span className="pager-total">1</span>
            </div>
            <button className="pager-btn" disabled title="Next page">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
