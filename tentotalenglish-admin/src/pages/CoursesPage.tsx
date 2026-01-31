import { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import "./courses.css";

type Course = {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
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

  const footerText = useMemo(() => {
    const total = items.length;
    return `Showing ${total} of ${total} results`;
  }, [items.length]);

  return (
    <div className="courses-page">
      <div className="courses-head">
        <h1 className="courses-title">Courses</h1>
      </div>

      <div className="courses-card">
        {/* Create */}
        <div className="courses-create">
          <input
            className="courses-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            className="courses-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <input
            className="courses-input"
            value={monthlyPrice}
            onChange={(e) => setMonthlyPrice(Number(e.target.value))}
            placeholder="Monthly price"
            type="number"
          />

          <button className="courses-add" onClick={create}>
            Add
          </button>
        </div>

        {error && <div className="courses-error">{String(error)}</div>}

        <div className="courses-table-wrap">
          <table className="courses-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th className="num">Monthly</th>
                <th className="mono">ID</th>
                <th className="right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>
                    {isEditing(c.id) ? (
                      <input
                        className="courses-cell-input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      c.name
                    )}
                  </td>

                  <td>
                    {isEditing(c.id) ? (
                      <input
                        className="courses-cell-input"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    ) : (
                      c.description ?? ""
                    )}
                  </td>

                  <td className="num">
                    {isEditing(c.id) ? (
                      <input
                        className="courses-cell-input"
                        value={editMonthlyPrice}
                        onChange={(e) => setEditMonthlyPrice(Number(e.target.value))}
                        type="number"
                      />
                    ) : (
                      c.monthlyPrice
                    )}
                  </td>

                  <td className="mono">{c.id}</td>

                  <td className="right">
                    <div className="courses-actions">
                      {isEditing(c.id) ? (
                        <>
                          <button className="courses-action secondary" onClick={saveEdit}>
                            Save
                          </button>
                          <button className="courses-action ghost" onClick={cancelEdit}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="courses-action edit" onClick={() => startEdit(c)}>
                            <PencilIcon />
                            Edit
                          </button>
                          <button className="courses-action delete" onClick={() => remove(c.id)}>
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
                  <td className="courses-empty" colSpan={5}>
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="courses-footer">
          <div className="courses-foot-left">{footerText}</div>

          <div className="courses-pager">
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
