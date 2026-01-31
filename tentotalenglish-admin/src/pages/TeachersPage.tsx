import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import "./teachers.css";

type Teacher = {
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

export function TeachersPage() {
  const [items, setItems] = useState<Teacher[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Create
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const load = async () => {
    const res = await http.get<Teacher[]>("/teachers");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setError(null);
    try {
      await http.post("/teachers", { firstName, lastName, email });
      setFirstName("");
      setLastName("");
      setEmail("");
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error creating teacher");
    }
  };

  const startEdit = (t: Teacher) => {
    setError(null);
    setEditingId(t.id);
    setEditFirstName(t.firstName);
    setEditLastName(t.lastName);
    setEditEmail(t.email);
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
      await http.put(`/api/teachers/${editingId}`, {
        firstName: editFirstName,
        lastName: editLastName,
        email: editEmail,
      });
      cancelEdit();
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error updating teacher");
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      const ok = confirm("Delete this teacher?");
      if (!ok) return;

      await http.delete(`/api/teachers/${id}`);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error deleting teacher");
    }
  };

  const isEditing = (id: string) => editingId === id;

  // UI-only footer text (no pagination logic yet)
  const footerText = useMemo(() => {
    const total = items.length;
    return `Showing ${total} of ${total} results`;
  }, [items.length]);

  return (
    <div className="teachers-page">
      <div className="teachers-head">
        <h1 className="teachers-title">Teachers</h1>
      </div>

      <div className="teachers-card">
        {/* Create */}
        <div className="teachers-create">
          <input
            className="teachers-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
          <input
            className="teachers-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
          <input
            className="teachers-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <button className="teachers-add" onClick={create}>
            Add
          </button>
        </div>

        {error && <div className="teachers-error">{String(error)}</div>}

        <div className="teachers-table-wrap">
          <table className="teachers-table">
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
              {items.map((t) => (
                <tr key={t.id}>
                  <td>
                    {isEditing(t.id) ? (
                      <input
                        className="teachers-cell-input"
                        value={editFirstName}
                        onChange={(e) => setEditFirstName(e.target.value)}
                      />
                    ) : (
                      t.firstName
                    )}
                  </td>

                  <td>
                    {isEditing(t.id) ? (
                      <input
                        className="teachers-cell-input"
                        value={editLastName}
                        onChange={(e) => setEditLastName(e.target.value)}
                      />
                    ) : (
                      t.lastName
                    )}
                  </td>

                  <td>
                    {isEditing(t.id) ? (
                      <input
                        className="teachers-cell-input"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                      />
                    ) : (
                      t.email
                    )}
                  </td>

                  <td className="mono">{t.id}</td>

                  <td className="right">
                    <div className="teachers-actions">
                      {isEditing(t.id) ? (
                        <>
                          <button className="teachers-action secondary" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="teachers-action ghost" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="teachers-action edit" onClick={() => startEdit(t)}>
                            <PencilIcon />
                            Edit
                          </button>
                          <button className="teachers-action delete" onClick={() => remove(t.id)}>
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
                  <td className="teachers-empty" colSpan={5}>
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="teachers-footer">
          <div className="teachers-foot-left">{footerText}</div>

          <div className="teachers-pager">
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
