import { useEffect, useState } from "react";
import { http } from "../api/http";

type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

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
    const res = await http.get<Teacher[]>("/api/teachers");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setError(null);
    try {
      await http.post("/api/teachers", { firstName, lastName, email });
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

  return (
    <div>
      <h2>Teachers</h2>

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
          {items.map((t) => (
            <tr key={t.id} style={{ borderTop: "1px solid #eee" }}>
              <td>
                {isEditing(t.id) ? (
                  <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} />
                ) : (
                  t.firstName
                )}
              </td>

              <td>
                {isEditing(t.id) ? (
                  <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} />
                ) : (
                  t.lastName
                )}
              </td>

              <td>
                {isEditing(t.id) ? (
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                ) : (
                  t.email
                )}
              </td>

              <td style={{ fontFamily: "monospace" }}>{t.id}</td>

              <td style={{ display: "flex", gap: 8 }}>
                {isEditing(t.id) ? (
                  <>
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(t)}>Edit</button>
                    <button onClick={() => remove(t.id)}>Delete</button>
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
