import { FormEvent, useEffect, useMemo, useState } from "react";
import { createGroup, getGroups, Group } from "../api/groupsApi";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

export default function GroupsPage() {
  const [form, setForm] = useState({
    level: "",
    schedule: "",
    monthlyPrice: "",
    chargeDay: "",
  });

  const [groups, setGroups] = useState<Group[]>([]);
  const [searchText, setSearchText] = useState("");

  const [createLoading, setCreateLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [listError, setListError] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) return groups;

    return groups.filter((group) => {
      return (
        group.level.toLowerCase().includes(search) ||
        group.schedule.toLowerCase().includes(search) ||
        String(group.chargeDay).includes(search) ||
        String(group.monthlyPrice).includes(search)
      );
    });
  }, [groups, searchText]);

  async function loadGroups() {
    try {
      setListLoading(true);
      setListError("");

      const data = await getGroups();
      setGroups(data);
    } catch (error: any) {
      setGroups([]);
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  }

  function clearForm() {
    setForm({
      level: "",
      schedule: "",
      monthlyPrice: "",
      chargeDay: "",
    });
    setMessage("");
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !form.level.trim() ||
      !form.schedule.trim() ||
      !form.monthlyPrice.trim() ||
      !form.chargeDay.trim()
    ) {
      setMessage("Completa todos los campos.");
      return;
    }

    try {
      setCreateLoading(true);

      await createGroup({
        level: form.level.trim(),
        schedule: form.schedule.trim(),
        monthlyPrice: Number(form.monthlyPrice),
        chargeDay: Number(form.chargeDay),
      });

      setMessage("Grupo guardado correctamente.");
      clearForm();
      await loadGroups();
    } catch (error: any) {
      setMessage(`Ocurrió un error: ${error.message}`);
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Groups</h1>
            <p className="muted">Crear y consultar grupos.</p>
          </div>
        </div>

        <div className="grid">
          <section className="card">
            <div className="section-title-row">
              <h2>Crear grupo</h2>

              <button
                type="button"
                className="button-secondary"
                onClick={clearForm}
              >
                Limpiar
              </button>
            </div>

            <form onSubmit={handleCreate} className="form-grid">
              <div className="field">
                <label>Nivel</label>
                <input
                  value={form.level}
                  onChange={(e) =>
                    setForm({ ...form, level: e.target.value })
                  }
                  placeholder="Nivel 1"
                />
              </div>

              <div className="field">
                <label>Horario</label>
                <input
                  value={form.schedule}
                  onChange={(e) =>
                    setForm({ ...form, schedule: e.target.value })
                  }
                  placeholder="Lunes y miércoles 7:00 PM"
                />
              </div>

              <div className="field">
                <label>Precio mensual</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.monthlyPrice}
                  onChange={(e) =>
                    setForm({ ...form, monthlyPrice: e.target.value })
                  }
                  placeholder="1500"
                />
              </div>

              <div className="field">
                <label>Día de cobro</label>
                <input
                  type="number"
                  value={form.chargeDay}
                  onChange={(e) =>
                    setForm({ ...form, chargeDay: e.target.value })
                  }
                  placeholder="15"
                />
              </div>

              <div className="actions">
                <button type="submit" disabled={createLoading}>
                  {createLoading ? "Guardando..." : "Crear grupo"}
                </button>
              </div>
            </form>

            {message && <div className="message-box">{message}</div>}
          </section>

          <section className="card card-full">
            <div className="section-title-row">
              <h2>Listado de grupos</h2>

              <div className="section-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={loadGroups}
                  disabled={listLoading}
                >
                  {listLoading ? "Cargando..." : "Recargar"}
                </button>
              </div>
            </div>

            <div className="inline-bar">
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por nivel, horario, precio o día"
              />
            </div>

            {listError && <div className="message-box error">{listError}</div>}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nivel</th>
                    <th>Horario</th>
                    <th>Precio mensual</th>
                    <th>Día de cobro</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="empty-cell">
                        {listLoading ? "Cargando..." : "Sin resultados"}
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => (
                      <tr key={group.id}>
                        <td>{group.level}</td>
                        <td>{group.schedule}</td>
                        <td>{formatMoney(group.monthlyPrice)}</td>
                        <td>{group.chargeDay}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}