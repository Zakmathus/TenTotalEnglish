import { useEffect, useState } from "react";
import { http } from "../api/http";

type Course = {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
};

export function CoursesPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Create
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editMonthlyPrice, setEditMonthlyPrice] = useState<number>(0);

  const load = async () => {
    const res = await http.get<Course[]>("/courses");
    setItems(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    setError(null);
    try {
      await http.post("/courses", {
        name,
        description: description.trim() ? description : null,
        monthlyPrice,
      });
      setName("");
      setDescription("");
      setMonthlyPrice(0);
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error creating course");
    }
  };

  const startEdit = (c: Course) => {
    setError(null);
    setEditingId(c.id);
    setEditName(c.name);
    setEditDescription(c.description ?? "");
    setEditMonthlyPrice(c.monthlyPrice);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditMonthlyPrice(0);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError(null);
    try {
      await http.put(`/api/courses/${editingId}`, {
        name: editName,
        description: editDescription.trim() ? editDescription : null,
        monthlyPrice: editMonthlyPrice,
      });
      cancelEdit();
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error updating course");
    }
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      const ok = confirm("Delete this course?");
      if (!ok) return;

      await http.delete(`/api/courses/${id}`);
      if (editingId === id) cancelEdit();
      await load();
    } catch (err: any) {
      setError(err?.response?.data ?? "Error deleting course");
    }
  };

  const isEditing = (id: string) => editingId === id;

  return (
    <div>
      <h2>Courses</h2>

      {/* Create */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <input
          value={monthlyPrice}
          onChange={(e) => setMonthlyPrice(Number(e.target.value))}
          placeholder="Monthly price"
          type="number"
        />
        <button onClick={create}>Add</button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{String(error)}</div>}

      <table cellPadding={8} style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Description</th>
            <th align="left">Monthly</th>
            <th align="left">Id</th>
            <th align="left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((c) => (
            <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
              <td>
                {isEditing(c.id) ? (
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                ) : (
                  c.name
                )}
              </td>

              <td>
                {isEditing(c.id) ? (
                  <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                ) : (
                  c.description ?? ""
                )}
              </td>

              <td>
                {isEditing(c.id) ? (
                  <input
                    value={editMonthlyPrice}
                    onChange={(e) => setEditMonthlyPrice(Number(e.target.value))}
                    type="number"
                    style={{ width: 120 }}
                  />
                ) : (
                  c.monthlyPrice
                )}
              </td>

              <td style={{ fontFamily: "monospace" }}>{c.id}</td>

              <td style={{ display: "flex", gap: 8 }}>
                {isEditing(c.id) ? (
                  <>
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(c)}>Edit</button>
                    <button onClick={() => remove(c.id)}>Delete</button>
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
