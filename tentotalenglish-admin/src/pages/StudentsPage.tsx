import { useEffect, useState } from "react";
import { http } from "../api/http";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

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
    const res = await http.get<Student[]>("/api/students");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setError(null);
    try {
      await http.post("/api/students", { firstName, lastName, email });
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

  return (
    <div>
      <h2>Students</h2>

      {/* Create */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <button onClick={create}>Add</button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{String(error)}</div>}

      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th align="left">First</th>
            <th align="left">Last</th>
            <th align="left">Email</th>
            <th align="left">Id</th>
            <th align="left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((s) => (
            <tr key={s.id} style={{ borderTop: "1px solid #eee" }}>
              <td>
                {isEditing(s.id) ? (
                  <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                ) : (
                  s.firstName
                )}
              </td>

              <td>
                {isEditing(s.id) ? (
                  <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                ) : (
                  s.lastName
                )}
              </td>

              <td>
                {isEditing(s.id) ? (
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                ) : (
                  s.email
                )}
              </td>

              <td style={{ fontFamily: "monospace" }}>{s.id}</td>

              <td style={{ display: "flex", gap: 8 }}>
                {isEditing(s.id) ? (
                  <>
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(s)}>Edit</button>
                    <button onClick={() => remove(s.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
